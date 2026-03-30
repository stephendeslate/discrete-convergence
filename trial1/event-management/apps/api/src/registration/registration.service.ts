// TRACED:EM-API-002 — Registration endpoint with capacity check and waitlist
// TRACED:EM-DATA-003 — Registration model with status machine and ticket type reference
// TRACED:EM-DATA-004 — Ticket prices as Int (cents) with Decimal for display calculations
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@event-management/shared';
import { paginatedResult } from '../common/pagination';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(organizationId: string, eventId: string, userId: string, ticketTypeId: string) {
    await this.prisma.setRLS(organizationId);

    // findFirst: required for tenant-scoped event lookup
    const event = await this.prisma.event.findFirst({ // tenant-scoped lookup
      where: { id: eventId, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException('Event is not open for registration');
    }

    // findFirst: required for tenant-scoped ticket type lookup
    const ticketType = await this.prisma.ticketType.findFirst({ // tenant-scoped lookup
      where: { id: ticketTypeId, eventId },
    });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    const registrationCount = await this.prisma.registration.count({
      where: { ticketTypeId, status: { in: ['PENDING', 'CONFIRMED'] } },
    });

    const status = registrationCount >= ticketType.quota ? 'WAITLISTED' : 'PENDING';

    return this.prisma.registration.create({
      data: {
        userId,
        eventId,
        ticketTypeId,
        organizationId,
        status,
      },
    });
  }

  async findByEvent(organizationId: string, eventId: string, page?: number, pageSize?: number) {
    await this.prisma.setRLS(organizationId);
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId, organizationId },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } }, ticketType: true },
      }),
      this.prisma.registration.count({ where: { eventId, organizationId } }),
    ]);
    return paginatedResult(data, total, skip, take);
  }

  async cancel(organizationId: string, id: string) {
    await this.prisma.setRLS(organizationId);
    // findFirst: required for tenant-scoped registration lookup
    const registration = await this.prisma.registration.findFirst({ // tenant-scoped lookup
      where: { id, organizationId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (registration.status === 'CANCELLED' || registration.status === 'CHECKED_IN') {
      throw new BadRequestException(`Cannot cancel registration in ${registration.status} status`);
    }
    return this.prisma.registration.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
}

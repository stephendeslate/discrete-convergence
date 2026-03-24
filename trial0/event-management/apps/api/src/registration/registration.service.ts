// TRACED:EM-REG-001 — Registration service with status machine and capacity check
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip } from '@event-management/shared';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(eventId: string, dto: CreateRegistrationDto, userId: string) {
    // findFirst justified: checking ticket availability by ticketTypeId
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: dto.ticketTypeId, eventId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.soldCount >= ticketType.quota) {
      throw new BadRequestException('Ticket type is sold out');
    }

    // findFirst justified: checking for duplicate registration by user+event
    const existing = await this.prisma.registration.findFirst({
      where: { userId, eventId, status: { notIn: ['CANCELLED'] } },
    });

    if (existing) {
      throw new ConflictException('Already registered for this event');
    }

    // TRACED:EM-REG-002 — Atomic registration with ticket count increment
    const [registration] = await this.prisma.$transaction([
      this.prisma.registration.create({
        data: {
          userId,
          eventId,
          ticketTypeId: dto.ticketTypeId,
          status: 'CONFIRMED',
          qrCode: `QR-${eventId.slice(0, 8)}-${Date.now()}`,
        },
      }),
      this.prisma.ticketType.update({
        where: { id: dto.ticketTypeId },
        data: { soldCount: { increment: 1 } },
      }),
    ]);

    return registration;
  }

  async findByEvent(eventId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId },
        skip,
        take: l,
        include: { user: { select: { name: true, email: true } }, ticketType: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { eventId } }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async cancel(registrationId: string, userId: string) {
    // findFirst justified: fetching by id+userId for ownership check
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, userId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === 'CANCELLED' || registration.status === 'CHECKED_IN') {
      throw new BadRequestException(`Cannot cancel a ${registration.status} registration`);
    }

    return this.prisma.$transaction([
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.ticketType.update({
        where: { id: registration.ticketTypeId },
        data: { soldCount: { decrement: 1 } },
      }),
    ]);
  }
}

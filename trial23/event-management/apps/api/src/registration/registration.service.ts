// TRACED: EM-API-003 — Registration management with event scoping
// TRACED: EM-EDGE-008 — Registration for invalid event → 404
// TRACED: EM-EDGE-009 — Registration error → proper error message
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@repo/shared';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(organizationId: string, eventId: string, dto: CreateRegistrationDto) {
    // findFirst: verify event exists and belongs to this organization before registering
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      return await this.prisma.registration.create({
        data: {
          eventId,
          ticketTypeId: dto.ticketTypeId,
          attendeeName: dto.attendeeName,
          attendeeEmail: dto.attendeeEmail,
          status: 'PENDING',
          organizationId,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(`Registration failed: ${error.message}`);
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async findAllByEvent(organizationId: string, eventId: string, page?: number, limit?: number) {
    // findFirst: verify event exists and belongs to this organization before listing registrations
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId, organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { eventId, organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async cancel(organizationId: string, id: string) {
    // findFirst: scope by organizationId for tenant isolation at application level
    const registration = await this.prisma.registration.findFirst({
      where: { id, organizationId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    });
  }
}

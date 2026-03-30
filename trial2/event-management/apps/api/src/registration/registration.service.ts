import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationStatus, EventStatus } from '@prisma/client';
import { getPagination } from '../common/pagination.utils';

// TRACED:EM-REG-001 — Registration service manages registration lifecycle
// TRACED:EM-REG-002 — Registration validates event is open before registering

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    dto: CreateRegistrationDto,
    userId: string,
    organizationId: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { registrations: true },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.status !== EventStatus.REGISTRATION_OPEN &&
      event.status !== EventStatus.PUBLISHED
    ) {
      throw new BadRequestException('Event is not open for registration');
    }

    // findFirst: checking if user already registered for this event — compound condition not a unique key
    const existing = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId: dto.eventId,
        status: { not: RegistrationStatus.CANCELLED },
      },
    });

    if (existing) {
      throw new BadRequestException('Already registered for this event');
    }

    const activeRegistrations = event.registrations.filter(
      (r) => r.status !== RegistrationStatus.CANCELLED,
    ).length;

    if (event.capacity > 0 && activeRegistrations >= event.capacity) {
      throw new BadRequestException('Event is at capacity');
    }

    return this.prisma.registration.create({
      data: {
        userId,
        eventId: dto.eventId,
        ticketTypeId: dto.ticketTypeId,
        organizationId,
        status: RegistrationStatus.CONFIRMED,
      },
      include: { event: true, ticketType: true },
    });
  }

  async findByEvent(
    eventId: string,
    organizationId: string,
    params: { page?: number; pageSize?: number },
  ) {
    const { skip, take, page, pageSize } = getPagination(params);

    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId, organizationId },
        include: { user: true, ticketType: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { eventId, organizationId } }),
    ]);

    return { items, total, page, pageSize };
  }

  async cancel(id: string, organizationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration || registration.organizationId !== organizationId) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    if (registration.status === RegistrationStatus.CHECKED_IN) {
      throw new BadRequestException('Cannot cancel a checked-in registration');
    }

    return this.prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
    });
  }
}

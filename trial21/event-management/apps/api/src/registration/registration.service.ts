import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './registration.dto';
import { buildPagination } from '../common/pagination.utils';
import type { Registration } from '@prisma/client';

/** TRACED:EM-REG-002 — Registration service with capacity checks and waitlist */
@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    eventId: string,
    userId: string,
    dto: CreateRegistrationDto,
  ): Promise<Registration> {
    // findFirst: verify ticket type belongs to event
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: dto.ticketTypeId, eventId },
    });
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found for this event');
    }

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException('Event is not open for registration');
    }

    // Check sold out — TRACED:EM-REG-003
    const currentCount = await this.prisma.registration.count({
      where: {
        ticketTypeId: dto.ticketTypeId,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });
    if (currentCount >= ticketType.quota) {
      throw new BadRequestException('This ticket type is sold out');
    }

    return this.prisma.registration.create({
      data: {
        userId,
        eventId,
        ticketTypeId: dto.ticketTypeId,
        status: 'CONFIRMED',
      },
    });
  }

  async findAll(eventId: string, page: number, limit: number): Promise<{ data: Registration[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { eventId } }),
    ]);
    return { data, total };
  }

  async findUserRegistrations(userId: string, page: number, limit: number): Promise<{ data: Registration[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { userId },
        include: { event: true, ticketType: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  async cancel(registrationId: string, userId: string): Promise<Registration> {
    // findFirst: verify ownership of registration
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, userId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration is already cancelled');
    }
    if (registration.status === 'CHECKED_IN') {
      throw new BadRequestException('Cannot cancel after check-in');
    }

    const updated = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' },
    });

    // Auto-promote from waitlist FIFO — TRACED:EM-REG-004
    await this.promoteFromWaitlist(registration.eventId, registration.ticketTypeId);

    return updated;
  }

  private async promoteFromWaitlist(eventId: string, ticketTypeId: string): Promise<void> {
    // findFirst: get next waitlist entry by position
    const next = await this.prisma.waitlistEntry.findFirst({
      where: { eventId },
      orderBy: { position: 'asc' },
    });
    if (!next) {
      return;
    }
    // findFirst: find user by email for auto-registration
    const user = await this.prisma.user.findFirst({
      where: { email: next.email },
    });
    if (user) {
      await this.prisma.registration.create({
        data: {
          userId: user.id,
          eventId,
          ticketTypeId,
          status: 'CONFIRMED',
        },
      });
    }
    await this.prisma.waitlistEntry.delete({ where: { id: next.id } });
  }
}

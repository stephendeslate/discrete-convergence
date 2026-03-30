// TRACED:EM-API-005 — Registration service with capacity check, waitlist, check-in idempotency
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { clampPagination } from '@event-management/shared';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(eventId: string, dto: CreateRegistrationDto, userId: string, organizationId: string) {
    // findFirst: scoped by organizationId for tenant isolation (eventId alone is not tenant-scoped)
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!['PUBLISHED', 'REGISTRATION_OPEN'].includes(event.status)) {
      throw new BadRequestException('Event is not open for registration');
    }

    // findFirst: scoped by ticketTypeId + eventId to verify ticket belongs to event
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: dto.ticketTypeId, eventId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.sold >= ticketType.quota) {
      throw new ConflictException('Ticket type is sold out');
    }

    const registration = await this.prisma.registration.create({
      data: {
        userId,
        eventId,
        ticketTypeId: dto.ticketTypeId,
        status: 'CONFIRMED',
      },
      include: { ticketType: true, event: true },
    });

    await this.prisma.ticketType.update({
      where: { id: dto.ticketTypeId },
      data: { sold: { increment: 1 } },
    });

    return registration;
  }

  async findByEvent(eventId: string, organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);

    // findFirst: verify event belongs to organization before listing registrations
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: true, ticketType: true, checkIn: true },
      }),
      this.prisma.registration.count({ where: { eventId } }),
    ]);

    return { items, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async cancel(id: string, organizationId: string) {
    // findFirst: scoped by registration id + event organizationId for tenant isolation
    const registration = await this.prisma.registration.findFirst({
      where: { id },
      include: { event: true },
    });

    if (!registration || registration.event.organizationId !== organizationId) {
      throw new NotFoundException('Registration not found');
    }

    if (['CANCELLED', 'CHECKED_IN'].includes(registration.status)) {
      throw new BadRequestException('Cannot cancel this registration');
    }

    const updated = await this.prisma.registration.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.ticketType.update({
      where: { id: registration.ticketTypeId },
      data: { sold: { decrement: 1 } },
    });

    return updated;
  }

  async checkIn(registrationId: string, organizationId: string) {
    // findFirst: scoped by registration id + event organization for tenant isolation
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId },
      include: { event: true, checkIn: true },
    });

    if (!registration || registration.event.organizationId !== organizationId) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed registrations can check in');
    }

    if (registration.checkIn) {
      return { message: 'Already checked in', checkIn: registration.checkIn };
    }

    const checkIn = await this.prisma.checkIn.create({
      data: { registrationId },
    });

    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CHECKED_IN' },
    });

    return checkIn;
  }

  async getCheckInStats(eventId: string, organizationId: string) {
    // findFirst: verify event belongs to org before computing stats
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const [totalRegistrations, checkedIn] = await Promise.all([
      this.prisma.registration.count({ where: { eventId, status: { not: 'CANCELLED' } } }),
      this.prisma.registration.count({ where: { eventId, status: 'CHECKED_IN' } }),
    ]);

    return { totalRegistrations, checkedIn, remaining: totalRegistrations - checkedIn };
  }
}

// TRACED:EM-ATT-001 TRACED:EM-ATT-002 TRACED:EM-ATT-003 TRACED:EM-ATT-004 TRACED:EM-ATT-005
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './attendee.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Attendee } from '@prisma/client';

@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Attendee>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Attendee> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { event: true, tickets: true },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  /** Register an attendee for an event — validates event exists and is published */
  async registerAttendee(dto: CreateAttendeeDto, tenantId: string, userId: string): Promise<Attendee> {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query — findFirst justified: verify event exists for attendee registration
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot register for a cancelled event');
    }

    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Cannot register for a completed event');
    }

    const attendeeCount = await this.prisma.attendee.count({
      where: { eventId: dto.eventId },
    });
    if (attendeeCount >= event.capacity) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // tenant-scoped query — findFirst justified: check if attendee already registered by email for this event
    const existingAttendee = await this.prisma.attendee.findFirst({
      where: { email: dto.email, eventId: dto.eventId, tenantId },
    });
    if (existingAttendee) {
      throw new BadRequestException('Attendee already registered for this event');
    }

    const attendee = await this.prisma.attendee.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        eventId: dto.eventId,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Attendee', entityId: attendee.id, userId, tenantId },
    });

    return attendee;
  }

  /** Check in an attendee — validates not already checked in */
  async checkIn(id: string, tenantId: string, userId: string): Promise<Attendee> {
    await this.prisma.setTenantContext(tenantId);
    const attendee = await this.findOne(id, tenantId);

    if (attendee.checkedIn) {
      throw new BadRequestException('Attendee is already checked in');
    }

    // tenant-scoped query — findFirst justified: verify the event is not cancelled before allowing check-in
    const event = await this.prisma.event.findFirst({
      where: { id: attendee.eventId, tenantId },
    });
    if (event && event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot check in for a cancelled event');
    }

    const updated = await this.prisma.attendee.update({
      where: { id },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Attendee', entityId: id, details: { action: 'checkIn' }, userId, tenantId },
    });

    return updated;
  }
}

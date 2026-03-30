import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, Prisma } from '@prisma/client';
import { getPagination } from '../common/pagination.utils';

// TRACED:EM-EVT-001 — Event service implements status machine transitions
// TRACED:EM-DATA-001 — Event service uses $executeRaw for audit logging
// TRACED:EM-DATA-002 — Database indexes on tenantId, status, and composite keys (defined in schema.prisma)

const VALID_TRANSITIONS: Record<string, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
  [EventStatus.PUBLISHED]: [EventStatus.REGISTRATION_OPEN, EventStatus.CANCELLED],
  [EventStatus.REGISTRATION_OPEN]: [EventStatus.REGISTRATION_CLOSED, EventStatus.CANCELLED],
  [EventStatus.REGISTRATION_CLOSED]: [EventStatus.IN_PROGRESS, EventStatus.CANCELLED],
  [EventStatus.IN_PROGRESS]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
  [EventStatus.COMPLETED]: [EventStatus.ARCHIVED],
  [EventStatus.ARCHIVED]: [],
  [EventStatus.CANCELLED]: [],
};

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, organizationId: string) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        timezone: dto.timezone ?? 'UTC',
        capacity: dto.capacity ?? 0,
        organizationId,
        venueId: dto.venueId,
      },
      include: { venue: true, ticketTypes: true },
    });
  }

  async findAll(organizationId: string, params: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(params);

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        include: { venue: true, ticketTypes: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string, organizationId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, ticketTypes: true, sessions: true },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string) {
    const event = await this.findOne(id, organizationId);

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Completed events cannot be edited');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        timezone: dto.timezone,
        capacity: dto.capacity,
        venueId: dto.venueId,
      },
      include: { venue: true, ticketTypes: true },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.event.delete({ where: { id } });
  }

  async publish(id: string, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    this.validateTransition(event.status, EventStatus.PUBLISHED);

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED },
    });
  }

  async cancel(id: string, organizationId: string, userId: string) {
    const event = await this.findOne(id, organizationId);
    this.validateTransition(event.status, EventStatus.CANCELLED);

    await this.prisma.$executeRaw(
      Prisma.sql`INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, organization_id, created_at)
        VALUES (gen_random_uuid(), 'EVENT_CANCELLED', 'Event', ${id}, ${userId}, ${organizationId}, NOW())`
    );

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  private validateTransition(
    currentStatus: EventStatus,
    targetStatus: EventStatus,
  ): void {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions?.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${targetStatus}`,
      );
    }
  }
}

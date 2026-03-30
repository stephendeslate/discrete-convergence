// TRACED:EM-EVT-001 TRACED:EM-EVT-002 TRACED:EM-EVT-003 TRACED:EM-EVT-004 TRACED:EM-EVT-005 TRACED:EM-EVT-006 TRACED:EM-EVT-007
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Event } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Event>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Event> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: fetching by PK + tenant isolation for RLS enforcement
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, tickets: true, sessions: true, sponsors: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(dto: CreateEventDto, tenantId: string, userId: string): Promise<Event> {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query — Check for duplicate slug within tenant — findFirst justified: unique constraint check
    const existingSlug = await this.prisma.event.findFirst({
      where: { slug: dto.slug, tenantId },
    });
    if (existingSlug) {
      throw new ConflictException('Event with this slug already exists');
    }

    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        capacity: dto.capacity,
        venueId: dto.venueId,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Event', entityId: event.id, userId, tenantId },
    });

    return event;
  }

  async update(id: string, dto: UpdateEventDto, tenantId: string, userId: string): Promise<Event> {
    await this.prisma.setTenantContext(tenantId);
    const existing = await this.findOne(id, tenantId);

    if (dto.startDate && dto.endDate && new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    if (dto.endDate && !dto.startDate && new Date(dto.endDate) <= existing.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Event', entityId: event.id, userId, tenantId },
    });

    return event;
  }

  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.prisma.event.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Event', entityId: id, userId, tenantId },
    });
  }

  /** Publish an event — requires DRAFT status and future start date */
  async publish(id: string, tenantId: string, userId: string): Promise<Event> {
    await this.prisma.setTenantContext(tenantId);
    const event = await this.findOne(id, tenantId);

    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Only draft events can be published');
    }

    if (event.startDate <= new Date()) {
      throw new BadRequestException('Cannot publish an event with a past start date');
    }

    if (event.capacity <= 0) {
      throw new BadRequestException('Event must have positive capacity to publish');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Event', entityId: id, details: { action: 'publish' }, userId, tenantId },
    });

    return updated;
  }

  /** Cancel an event — only DRAFT or PUBLISHED events can be cancelled */
  async cancel(id: string, tenantId: string, userId: string): Promise<Event> {
    await this.prisma.setTenantContext(tenantId);
    const event = await this.findOne(id, tenantId);

    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Event is already cancelled');
    }

    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed event');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Event', entityId: id, details: { action: 'cancel' }, userId, tenantId },
    });

    return updated;
  }
}

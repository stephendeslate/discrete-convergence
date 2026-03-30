// TRACED: EM-DATA-006 — executeRaw with Prisma.sql for RLS tenant context
// TRACED: EM-DATA-001 — Queries against models with @@map snake_case table names
// TRACED: EM-API-005 — Pagination clamping with clampPagination from shared
// TRACED: EM-EVENT-001 — Event CRUD service with status workflow validation
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, EventStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CANCELLED'],
  CANCELLED: [],
};

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateEventDto) {
    await this.setTenantContext(tenantId);
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'DRAFT',
        tenantId,
        venueId: dto.venueId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.event, { tenantId }, page, limit,
      { include: { venue: true, tickets: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, tickets: true, registrations: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateEventDto) {
    const event = await this.findOne(tenantId, id);

    if (dto.status) {
      const allowed = VALID_TRANSITIONS[event.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${event.status} to ${dto.status}`,
        );
      }
    }

    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status as EventStatus | undefined,
        venueId: dto.venueId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const event = await this.findOne(tenantId, id);
    return this.prisma.event.update({
      where: { id: event.id },
      data: { status: 'CANCELLED' },
    });
  }
}

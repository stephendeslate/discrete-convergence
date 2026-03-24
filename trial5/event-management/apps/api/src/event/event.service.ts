// TRACED:EM-API-001 — EventService with full CRUD, tenant-scoped queries, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { CreateEventDto } from './dto/create-event.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { PaginatedResult } from '../common/pagination.utils';
import type { Event } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto): Promise<Event> {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED') ?? 'DRAFT',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        tenantId: dto.tenantId,
        venueId: dto.venueId,
      },
      include: { venue: true },
    });
  }

  async findAll(
    tenantId: string,
    params: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<Event>> {
    const { skip, take } = clampPagination(params);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { venue: true },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, tickets: true, attendees: true },
    });
    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }

  async update(id: string, tenantId: string, dto: UpdateEventDto): Promise<Event> {
    await this.findOne(id, tenantId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
      include: { venue: true },
    });
  }

  async remove(id: string, tenantId: string): Promise<Event> {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }
}

// TRACED: EM-API-003 — Event service with CRUD operations
// TRACED: EM-DATA-004 — Event model with status enum
// TRACED: EM-EDGE-004 — Event not found handling
// TRACED: EM-EDGE-007 — Event status transition validation

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { getPaginationParams, paginate, PaginatedResult } from '../common/pagination.utils';
import { Event } from '@prisma/client';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEventDto): Promise<Event> {
    // TRACED: EM-EDGE-008 — Validate end date is after start date
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.prisma.event.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venueId: dto.venueId,
      },
    });

    this.logger.log(`Event created: ${event.id}`);
    return event;
  }

  async findAll(
    tenantId: string,
    page?: string,
    pageSize?: string,
  ): Promise<PaginatedResult<Event>> {
    const { skip, take, page: p, pageSize: ps } = getPaginationParams(page, pageSize);

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

    return paginate(data, total, p, ps);
  }

  async findOne(tenantId: string, id: string): Promise<Event> {
    // findFirst: tenant-scoped lookup by event ID to enforce tenant isolation
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, ticketTypes: true },
    });

    if (!event) {
      // TRACED: EM-EDGE-004 — Event not found
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateEventDto): Promise<Event> {
    await this.findOne(tenantId, id);

    // TRACED: EM-EDGE-008 — Validate dates if both provided
    if (dto.startDate && dto.endDate && new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.venueId !== undefined) updateData.venueId = dto.venueId;

    return this.prisma.event.update({
      where: { id },
      data: updateData,
    });
  }

  async publish(tenantId: string, id: string): Promise<Event> {
    const event = await this.findOne(tenantId, id);

    // TRACED: EM-EDGE-007 — Only DRAFT events can be published
    if (event.status !== 'DRAFT') {
      throw new BadRequestException(`Cannot publish event with status ${event.status}`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async cancel(tenantId: string, id: string): Promise<Event> {
    const event = await this.findOne(tenantId, id);

    // TRACED: EM-EDGE-007 — Only DRAFT or PUBLISHED events can be cancelled
    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      throw new BadRequestException(`Cannot cancel event with status ${event.status}`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async remove(tenantId: string, id: string): Promise<Event> {
    const event = await this.findOne(tenantId, id);

    // TRACED: EM-EDGE-009 — Only DRAFT events can be deleted
    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Only draft events can be deleted');
    }

    return this.prisma.event.delete({ where: { id } });
  }
}

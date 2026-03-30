import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, Prisma } from '@prisma/client';
import { clampPageSize, calculateSkip } from '@event-management/shared';

// TRACED: EM-EVENT-003
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        capacity: dto.capacity,
        venueId: dto.venueId,
        tenantId,
        status: EventStatus.DRAFT,
      },
      include: { venue: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const take = clampPageSize(pageSize);
    const skip = calculateSkip(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);

    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need tenant-scoped lookup (not just by primary key)
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, schedules: true, tickets: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateEventDto) {
    await this.findOne(tenantId, id);

    const data: Prisma.EventUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.status !== undefined) data.status = dto.status as EventStatus;
    if (dto.venueId !== undefined) data.venue = { connect: { id: dto.venueId } };

    return this.prisma.event.update({
      where: { id },
      data,
      include: { venue: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED: EM-DATA-011
  async getEventStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM events WHERE tenant_id = ${tenantId}`,
    );
    return { count: result };
  }
}

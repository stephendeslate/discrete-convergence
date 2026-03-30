import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { clampPagination } from '@event-management/shared';

// TRACED:EM-EVT-003
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateEventDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        price: new Prisma.Decimal(dto.price),
        capacity: dto.capacity,
        venueId: dto.venueId,
        categoryId: dto.categoryId,
        organizerId: userId,
        tenantId,
      },
      include: { venue: true, category: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    // TRACED:EM-PERF-003
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true, category: true, organizer: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for RLS-like tenant scoping
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, category: true, organizer: true, tickets: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
        status: dto.status as 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | undefined,
      },
      include: { venue: true, category: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED:EM-DATA-002
  async getEventStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM events WHERE tenant_id = ${tenantId}`
    );
    return { affectedRows: result };
  }
}

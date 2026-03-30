import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Prisma } from '@prisma/client';
import { clampPagination, paginatedResult } from '@event-management/shared';

// TRACED: EM-EVENT-002
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEventDto) {
    const data: Prisma.EventCreateInput = {
      title: dto.title,
      description: dto.description,
      status: (dto.status ?? 'DRAFT') as Prisma.EventCreateInput['status'],
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      venue: { connect: { id: dto.venueId } },
      tenantId,
    };
    return this.prisma.event.create({ data, include: { venue: true } });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true },
        skip: params.skip,
        take: params.take,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return paginatedResult(data, total, params);
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, tickets: true, schedules: true, attendees: true },
    });
    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateEventDto) {
    await this.findOne(tenantId, id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as Prisma.EventUpdateInput['status'] }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.venueId !== undefined && { venue: { connect: { id: dto.venueId } } }),
      },
      include: { venue: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED: EM-DATA-002
  async countByStatus(tenantId: string) {
    return this.prisma.$executeRaw(
      Prisma.sql`SELECT status, COUNT(*) as count FROM events WHERE tenant_id = ${tenantId} GROUP BY status`,
    );
  }
}

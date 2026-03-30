import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { clampPagination } from '@event-management/shared';
import { Prisma } from '@prisma/client';
import { EventStatus } from '@prisma/client';

// TRACED: EM-EVENT-001
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: EM-DATA-005
  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: (dto.status as EventStatus) ?? 'DRAFT',
        price: dto.price ?? 0,
        capacity: dto.capacity ?? 0,
        venueId: dto.venueId,
        tenantId,
      },
      include: { venue: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true, registrations: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here because we need to filter by both id and tenantId for tenant isolation
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, registrations: { include: { attendee: true } } },
    });
    if (!event) {
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
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status as EventStatus }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
      include: { venue: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.event.delete({ where: { id } });
  }
}

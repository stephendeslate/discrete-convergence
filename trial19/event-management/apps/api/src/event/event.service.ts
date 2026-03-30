import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, Prisma } from '@prisma/client';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-EVENT-001
// TRACED: EM-DATA-001
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we need composite tenant+id check without unique constraint on both
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, registrations: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(dto: CreateEventDto, tenantId: string) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: (dto.status as EventStatus) ?? EventStatus.DRAFT,
        venueId: dto.venueId,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status as EventStatus }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED: EM-DATA-005
  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@event-management/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, tenantId: string) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate,
        endDate,
        status: (dto.status as Prisma.EnumEventStatusFilter['equals']) ?? 'DRAFT',
        venueId: dto.venueId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { venue: true },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: lookup event by ID scoped to tenant
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, tickets: true, schedules: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.venueId !== undefined) data.venueId = dto.venueId;

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }

  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}

// TRACED: EM-EVENT-001
// TRACED: EM-DATA-001
// TRACED: EM-DATA-002
// TRACED: EM-DATA-005
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { getPaginationParams } from '../common/pagination.utils';
import { EventStatus, Prisma } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }

  async create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: (dto.status as EventStatus) ?? EventStatus.DRAFT,
        price: dto.price ?? 0,
        capacity: dto.capacity ?? 0,
        venueId: dto.venueId,
        tenantId,
      },
      include: { venue: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = getPaginationParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need to scope by both id and tenantId for tenant isolation
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: { venue: true, registrations: true },
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
        title: dto.title,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status as EventStatus | undefined,
        price: dto.price,
        capacity: dto.capacity,
        venueId: dto.venueId,
      },
      include: { venue: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.event.delete({ where: { id } });
  }
}

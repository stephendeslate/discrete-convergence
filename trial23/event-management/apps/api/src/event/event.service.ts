// TRACED: EM-API-001 — Event CRUD with organization scoping
// TRACED: EM-EDGE-003 — Event not found → 404
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@repo/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venueId: dto.venueId ?? null,
        status: 'DRAFT',
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(organizationId: string, id: string) {
    // findFirst: scope by organizationId for tenant isolation at application level
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(organizationId: string, id: string, dto: UpdateEventDto) {
    const event = await this.findOne(organizationId, id);
    return this.prisma.event.update({
      where: { id: event.id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const event = await this.findOne(organizationId, id);
    return this.prisma.event.delete({ where: { id: event.id } });
  }

  async publish(organizationId: string, id: string) {
    const event = await this.findOne(organizationId, id);
    return this.prisma.event.update({
      where: { id: event.id },
      data: { status: 'PUBLISHED' },
    });
  }

  async cancel(organizationId: string, id: string) {
    const event = await this.findOne(organizationId, id);
    return this.prisma.event.update({
      where: { id: event.id },
      data: { status: 'CANCELLED' },
    });
  }
}

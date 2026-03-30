import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { parsePagination } from '@repo/shared';
import { EventStatus } from '@prisma/client';

// TRACED: EM-EVENT-001
// TRACED: EM-DATA-003
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const { skip, limit, page } = parsePagination(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: { venue: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, tenantId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, ticketTypes: true, sessions: true },
    });
    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        capacity: dto.capacity ?? 0,
        status: (dto.status as EventStatus) ?? EventStatus.DRAFT,
        venueId: dto.venueId,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateEventDto) {
    await this.findOne(id, tenantId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.status !== undefined && { status: dto.status as EventStatus }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }
}

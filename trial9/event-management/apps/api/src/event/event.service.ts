import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { parsePagination } from '@event-management/shared';
import { EventStatus } from '@prisma/client';

// TRACED: EM-EVENT-002
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEventDto) {
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
        status: (dto.status as EventStatus) ?? 'DRAFT',
        tenantId,
        venueId: dto.venueId,
      },
      include: { venue: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { tenantId },
        include: { venue: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
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
    const event = await this.findOne(tenantId, id);

    if (dto.status && event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update a cancelled event');
    }

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
      include: { venue: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.event.delete({ where: { id } });
  }
}

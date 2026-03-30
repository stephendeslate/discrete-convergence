// TRACED:EM-API-002 — Event service with Prisma includes for N+1 prevention
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { clampPagination } from '@event-management/shared';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, organizationId: string) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        timezone: dto.timezone ?? 'UTC',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        organizationId,
        venueId: dto.venueId,
      },
      include: { venue: true, ticketTypes: true },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { venue: true, ticketTypes: true, _count: { select: { registrations: true } } },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return { items, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, organizationId: string) {
    // findFirst: scoped by organizationId for tenant isolation (id alone is not tenant-scoped)
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
      include: {
        venue: true,
        ticketTypes: true,
        sessions: true,
        registrationFields: true,
        _count: { select: { registrations: true } },
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Cannot edit completed events');
    }
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
      include: { venue: true, ticketTypes: true },
    });
  }

  async publish(id: string, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Only draft events can be published');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async cancel(id: string, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed event');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.event.delete({ where: { id } });
  }

  async findPublicEvents(page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take,
        orderBy: { startDate: 'asc' },
        include: { venue: true, ticketTypes: true },
      }),
      this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
    ]);
    return { items, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }
}

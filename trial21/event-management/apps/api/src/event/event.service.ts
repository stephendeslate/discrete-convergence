import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { buildPagination } from '../common/pagination.utils';
import type { Event as PrismaEvent } from '@prisma/client';

/** Valid status transitions — TRACED:EM-EVT-002 */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
};

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, organizationId: string): Promise<PrismaEvent> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        timezone: dto.timezone,
        startDate: start,
        endDate: end,
        organizationId,
        venueId: dto.venueId,
      },
    });
  }

  async findAll(organizationId: string, page: number, limit: number): Promise<{ data: PrismaEvent[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return { data, total };
  }

  async findOne(id: string, organizationId: string): Promise<PrismaEvent> {
    // findFirst: filtering by composite key (id + organizationId for tenant isolation)
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
      include: { ticketTypes: true, sessions: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string): Promise<PrismaEvent> {
    const event = await this.findOne(id, organizationId);

    if (dto.status) {
      const allowed = STATUS_TRANSITIONS[event.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${event.status} to ${dto.status}`,
        );
      }
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
        ...(dto.status !== undefined && { status: dto.status as PrismaEvent['status'] }),
      },
    });
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findOne(id, organizationId);
    await this.prisma.event.delete({ where: { id } });
  }

  async publish(id: string, organizationId: string): Promise<PrismaEvent> {
    return this.update(id, { status: 'PUBLISHED' }, organizationId);
  }

  async cancel(id: string, organizationId: string): Promise<PrismaEvent> {
    const event = await this.findOne(id, organizationId);
    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed event');
    }
    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Event is already cancelled');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async findBySlug(slug: string): Promise<PrismaEvent> {
    // findFirst: searching by non-primary unique field (slug)
    const event = await this.prisma.event.findFirst({
      where: { slug, status: { not: 'DRAFT' } },
      include: { ticketTypes: true, venue: true, sessions: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findPublicEvents(page: number, limit: number): Promise<{ data: PrismaEvent[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const where = { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN'] as PrismaEvent['status'][] } };
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({ where, skip, take, orderBy: { startDate: 'asc' } }),
      this.prisma.event.count({ where }),
    ]);
    return { data, total };
  }
}

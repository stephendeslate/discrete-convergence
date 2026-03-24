// TRACED:EM-EVENT-001 — Event service with CRUD and status transitions
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip } from '@event-management/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, organizationId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  // TRACED:EM-PERF-003 — Pagination with clamping
  async findAll(organizationId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take: l,
        orderBy: { startDate: 'asc' },
        include: { venue: true, _count: { select: { registrations: true } } },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async findOne(id: string, organizationId: string) {
    // findFirst justified: fetching by id+organizationId for tenant scoping
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
      include: {
        venue: true,
        sessions: true,
        ticketTypes: true,
        registrationFields: true,
        _count: { select: { registrations: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status === 'COMPLETED') {
      throw new ForbiddenException('Completed events cannot be edited');
    }
    return this.prisma.event.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED:EM-EVENT-002 — Publish transition: DRAFT → PUBLISHED
  async publish(id: string, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT events can be published');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  // TRACED:EM-EVENT-003 — Cancel transition: any except COMPLETED → CANCELLED
  async cancel(id: string, organizationId: string) {
    const event = await this.findOne(id, organizationId);
    if (event.status === 'COMPLETED') {
      throw new BadRequestException('Completed events cannot be cancelled');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  // TRACED:EM-EVENT-004 — Public event listing (no auth required)
  async findPublic(page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { isPublic: true, status: { in: ['PUBLISHED', 'REGISTRATION_OPEN'] } },
        skip,
        take: l,
        orderBy: { startDate: 'asc' },
        include: { venue: true, organization: { select: { name: true, slug: true } } },
      }),
      this.prisma.event.count({
        where: { isPublic: true, status: { in: ['PUBLISHED', 'REGISTRATION_OPEN'] } },
      }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async findBySlug(orgSlug: string, eventSlug: string) {
    // findFirst justified: slug is unique per organization
    const event = await this.prisma.event.findFirst({
      where: {
        slug: eventSlug,
        organization: { slug: orgSlug },
        isPublic: true,
      },
      include: {
        venue: true,
        sessions: { orderBy: { startTime: 'asc' } },
        ticketTypes: true,
        organization: { select: { name: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }
}

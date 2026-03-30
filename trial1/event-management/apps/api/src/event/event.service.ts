// TRACED:EM-DATA-006 — $executeRaw with Prisma.sql template for RLS SET LOCAL
// TRACED:EM-DATA-001 — All Prisma models use @@map("snake_case") for PostgreSQL table names
// TRACED:EM-DATA-002 — Event model with status enum lifecycle and timezone field
// TRACED:EM-API-005 — Pagination with clampPagination helper
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@event-management/shared';
import { paginatedResult } from '../common/pagination';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['ARCHIVED'],
};

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateEventDto) {
    await this.prisma.setRLS(organizationId);
    return this.prisma.event.create({
      data: {
        ...dto,
        status: 'DRAFT',
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    await this.prisma.setRLS(organizationId);
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { startDate: 'asc' },
        include: { venue: true },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return paginatedResult(data, total, skip, take);
  }

  async findOne(organizationId: string, id: string) {
    await this.prisma.setRLS(organizationId);
    // findFirst: required for tenant-scoped lookup — ensures organizationId match
    const event = await this.prisma.event.findFirst({ // tenant-scoped lookup
      where: { id, organizationId },
      include: { venue: true, ticketTypes: true, sessions: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(organizationId: string, id: string, dto: UpdateEventDto) {
    const event = await this.findOne(organizationId, id);
    if (event.status === 'COMPLETED' || event.status === 'ARCHIVED') {
      throw new BadRequestException('Cannot edit completed or archived events');
    }
    return this.prisma.event.update({ where: { id }, data: dto });
  }

  async transitionStatus(organizationId: string, id: string, newStatus: string) {
    const event = await this.findOne(organizationId, id);
    const allowed = VALID_TRANSITIONS[event.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${event.status} to ${newStatus}`);
    }
    return this.prisma.event.update({ where: { id }, data: { status: newStatus as typeof event.status } });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    return this.prisma.event.delete({ where: { id } });
  }
}

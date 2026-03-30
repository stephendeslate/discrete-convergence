import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';
import { Prisma, EventStatus } from '@prisma/client';

// TRACED: EM-EVENT-001
// TRACED: EM-EDGE-004 — Get non-existent event returns 404 with correlationId
// TRACED: EM-EDGE-005 — Create event validates endDate after startDate
@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: EM-DATA-002
  async create(dto: CreateEventDto, tenantId: string) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxAttendees: dto.maxAttendees,
        ticketPrice: new Prisma.Decimal(dto.ticketPrice),
        venueId: dto.venueId,
        tenantId,
      },
      include: { venue: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = getPaginationParams(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: { venue: true, registrations: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return createPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, registrations: true },
    });

    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException('Event not found');
    }

    return event;
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
        ...(dto.maxAttendees !== undefined && { maxAttendees: dto.maxAttendees }),
        ...(dto.ticketPrice !== undefined && { ticketPrice: new Prisma.Decimal(dto.ticketPrice) }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
      include: { venue: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.event.delete({ where: { id } });
  }

  // TRACED: EM-DATA-003
  async executeRawTenantCheck(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
    return result;
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@event-management/shared';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';

// TRACED: EM-API-006 — Attendee service with tenant-scoped CRUD
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendeeDto, tenantId: string) {
    // findFirst: check for duplicate registration scoped to tenant
    const existing = await this.prisma.attendee.findFirst({
      where: { eventId: dto.eventId, userId: dto.userId, tenantId },
    });

    if (existing) {
      throw new ConflictException('User is already registered for this event');
    }

    return this.prisma.attendee.create({
      data: {
        eventId: dto.eventId,
        userId: dto.userId,
        ticketId: dto.ticketId,
        tenantId,
      },
      include: { event: true, user: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.pageSize,
        orderBy: { registeredAt: 'desc' },
        include: { event: true, user: true, ticket: true },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: lookup attendee by ID scoped to tenant for isolation
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { event: true, user: true, ticket: true },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return attendee;
  }

  async update(id: string, dto: UpdateAttendeeDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Record<string, unknown> = {};
    if (dto.ticketId !== undefined) data.ticketId = dto.ticketId;

    return this.prisma.attendee.update({
      where: { id },
      data,
      include: { event: true, user: true, ticket: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.delete({ where: { id } });
  }
}

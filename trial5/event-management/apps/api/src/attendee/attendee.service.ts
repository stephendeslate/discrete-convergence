// TRACED:EM-API-007 — AttendeeService with event-scoped queries, check-in status management
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { CreateAttendeeDto } from './dto/create-attendee.dto';
import type { UpdateAttendeeDto } from './dto/update-attendee.dto';
import type { PaginatedResult } from '../common/pagination.utils';
import type { Attendee } from '@prisma/client';

@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendeeDto): Promise<Attendee> {
    const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException(`Event ${dto.eventId} not found`);
    }
    const ticket = await this.prisma.ticket.findUnique({ where: { id: dto.ticketId } });
    if (!ticket || ticket.eventId !== dto.eventId) {
      throw new NotFoundException(`Ticket ${dto.ticketId} not found for event ${dto.eventId}`);
    }

    return this.prisma.attendee.create({
      data: {
        name: dto.name,
        email: dto.email,
        checkInStatus: (dto.checkInStatus as 'REGISTERED' | 'CHECKED_IN' | 'NO_SHOW') ?? 'REGISTERED',
        eventId: dto.eventId,
        ticketId: dto.ticketId,
      },
    });
  }

  async findAll(
    eventId: string,
    params: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<Attendee>> {
    const { skip, take } = clampPagination(params);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { eventId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { ticket: true },
      }),
      this.prisma.attendee.count({ where: { eventId } }),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string): Promise<Attendee> {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: { ticket: true, event: true },
    });
    if (!attendee) {
      throw new NotFoundException(`Attendee ${id} not found`);
    }
    return attendee;
  }

  async update(id: string, dto: UpdateAttendeeDto): Promise<Attendee> {
    await this.findOne(id);
    return this.prisma.attendee.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.checkInStatus !== undefined && {
          checkInStatus: dto.checkInStatus as 'REGISTERED' | 'CHECKED_IN' | 'NO_SHOW',
        }),
      },
    });
  }

  async remove(id: string): Promise<Attendee> {
    await this.findOne(id);
    return this.prisma.attendee.delete({ where: { id } });
  }
}

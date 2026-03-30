import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@event-management/shared';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// TRACED: EM-API-004 — Ticket service with tenant-scoped CRUD
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, tenantId: string) {
    return this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        type: dto.type as Prisma.EnumTicketTypeFilter['equals'],
        price: dto.price,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { event: true },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: lookup ticket by ID scoped to tenant for isolation
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: { event: true, attendee: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Record<string, unknown> = {};
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

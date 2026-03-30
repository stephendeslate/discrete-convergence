// TRACED:EM-API-005 — TicketService with Decimal price handling and event-scoped queries
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { CreateTicketDto } from './dto/create-ticket.dto';
import type { UpdateTicketDto } from './dto/update-ticket.dto';
import type { PaginatedResult } from '../common/pagination.utils';
import type { Ticket } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, tenantId: string): Promise<Ticket> {
    const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException(`Event ${dto.eventId} not found`);
    }

    const price = new Decimal(dto.price);
    if (price.isNegative()) {
      throw new BadRequestException('Price must be non-negative');
    }

    return this.prisma.ticket.create({
      data: {
        type: dto.type as 'GENERAL' | 'VIP' | 'EARLY_BIRD',
        price,
        quantity: dto.quantity,
        eventId: dto.eventId,
      },
    });
  }

  async findAll(
    eventId: string,
    params: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<Ticket>> {
    const { skip, take } = clampPagination(params);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { eventId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { eventId } }),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    await this.findOne(id);

    const data: Record<string, unknown> = {};
    if (dto.type !== undefined) data['type'] = dto.type;
    if (dto.quantity !== undefined) data['quantity'] = dto.quantity;
    if (dto.price !== undefined) {
      const price = new Decimal(dto.price);
      if (price.isNegative()) {
        throw new BadRequestException('Price must be non-negative');
      }
      data['price'] = price;
    }

    return this.prisma.ticket.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Ticket> {
    await this.findOne(id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

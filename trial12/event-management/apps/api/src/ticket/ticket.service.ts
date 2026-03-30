import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from '@prisma/client';
import { clampPageSize, calculateSkip } from '@event-management/shared';

// TRACED: EM-TICKET-003
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        price: dto.price,
        type: dto.type,
        eventId: dto.eventId,
        tenantId,
        status: TicketStatus.AVAILABLE,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const take = clampPageSize(pageSize);
    const skip = calculateSkip(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        include: { event: true },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);

    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need tenant-scoped lookup (not just by primary key)
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: { event: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(tenantId: string, id: string, dto: UpdateTicketDto) {
    await this.findOne(tenantId, id);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status as TicketStatus }),
      },
      include: { event: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { parsePagination } from '@event-management/shared';
import { TicketStatus } from '@prisma/client';

// TRACED: EM-TICKET-002
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        type: dto.type,
        price: dto.price,
        status: (dto.status as TicketStatus) ?? 'AVAILABLE',
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        include: { event: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!ticket || ticket.tenantId !== tenantId) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async update(tenantId: string, id: string, dto: UpdateTicketDto) {
    await this.findOne(tenantId, id);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.price !== undefined && { price: dto.price }),
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

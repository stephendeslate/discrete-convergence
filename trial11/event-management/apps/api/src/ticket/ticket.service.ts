import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { clampPagination, paginatedResult } from '@event-management/shared';

// TRACED: EM-TICKET-002
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        name: dto.name,
        price: dto.price,
        quantity: dto.quantity,
        status: (dto.status ?? 'AVAILABLE') as 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED',
        event: { connect: { id: dto.eventId } },
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        include: { event: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);
    return paginatedResult(data, total, params);
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
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.status !== undefined && { status: dto.status as 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED' }),
      },
      include: { event: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

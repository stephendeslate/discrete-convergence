import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { clampPagination } from '@event-management/shared';

// TRACED:EM-TKT-003
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, userId: string, tenantId: string) {
    return this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        userId,
        tenantId,
        price: new Prisma.Decimal(dto.price),
        seatInfo: dto.seatInfo,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        include: { event: true, user: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for tenant-scoped access
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: { event: true, user: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status as 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'USED' | undefined,
        seatInfo: dto.seatInfo,
      },
      include: { event: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';
import { TicketStatus } from '@prisma/client';

// TRACED: EM-TICKET-001
@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { tenantId },
        skip,
        take: pagination.limit,
        include: { event: true, ticketType: true, attendee: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { event: true, ticketType: true, attendee: true },
    });
    if (!ticket || ticket.tenantId !== tenantId) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async create(tenantId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        ticketTypeId: dto.ticketTypeId,
        price: dto.price,
        attendeeId: dto.attendeeId,
        status: (dto.status as TicketStatus) ?? TicketStatus.AVAILABLE,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateTicketDto) {
    await this.findOne(id, tenantId);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as TicketStatus }),
        ...(dto.attendeeId !== undefined && { attendeeId: dto.attendeeId }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.ticket.delete({ where: { id } });
  }
}

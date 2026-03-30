// TRACED: EM-TICKET-001 — Ticket CRUD service with sold-out and pricing validation
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateTicketDto) {
    await this.setTenantContext(tenantId);

    // Verify event belongs to tenant
    // findFirst: scope by tenantId for RLS enforcement at application level
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add tickets to a cancelled event');
    }

    return this.prisma.ticket.create({
      data: {
        name: dto.name,
        price: new Prisma.Decimal(dto.price),
        quantity: dto.quantity,
        sold: 0,
        status: 'AVAILABLE',
        eventId: dto.eventId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.ticket, { tenantId }, page, limit,
      { include: { event: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
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
    const ticket = await this.findOne(tenantId, id);

    if (dto.quantity !== undefined && dto.quantity < ticket.sold) {
      throw new BadRequestException('Cannot reduce quantity below sold count');
    }

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        name: dto.name,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
        quantity: dto.quantity,
        status: dto.status as TicketStatus | undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const ticket = await this.findOne(tenantId, id);
    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'CANCELLED' },
    });
  }
}

// TRACED:EM-TKT-001 TRACED:EM-TKT-002 TRACED:EM-TKT-003 TRACED:EM-TKT-004 TRACED:EM-TKT-005 TRACED:EM-TKT-006
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTicketDto } from './ticket.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Ticket } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Ticket>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.ticket.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Ticket> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: { event: true, attendee: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async create(dto: CreateTicketDto, tenantId: string, userId: string): Promise<Ticket> {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query — Verify event exists and belongs to tenant — findFirst justified: cross-entity existence check
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot create ticket for cancelled event');
    }

    const ticketCount = await this.prisma.ticket.count({
      where: { eventId: dto.eventId, status: { not: 'CANCELLED' } },
    });
    if (ticketCount >= event.capacity) {
      throw new BadRequestException('Event has reached capacity');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        type: dto.type ?? 'GENERAL',
        price: dto.price,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Ticket', entityId: ticket.id, userId, tenantId },
    });

    return ticket;
  }

  /** Cancel a ticket — only AVAILABLE or SOLD tickets can be cancelled */
  async cancelTicket(id: string, tenantId: string, userId: string): Promise<Ticket> {
    await this.prisma.setTenantContext(tenantId);
    const ticket = await this.findOne(id, tenantId);

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    if (ticket.status === 'REFUNDED') {
      throw new BadRequestException('Cannot cancel a refunded ticket');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Ticket', entityId: id, details: { action: 'cancel' }, userId, tenantId },
    });

    return updated;
  }

  /** Refund a ticket — only SOLD tickets can be refunded */
  async refundTicket(id: string, tenantId: string, userId: string): Promise<Ticket> {
    await this.prisma.setTenantContext(tenantId);
    const ticket = await this.findOne(id, tenantId);

    if (ticket.status !== 'SOLD') {
      throw new BadRequestException('Only sold tickets can be refunded');
    }

    if (ticket.price <= 0) {
      throw new BadRequestException('Cannot refund a free ticket');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Ticket', entityId: id, details: { action: 'refund' }, userId, tenantId },
    });

    return updated;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './ticket-type.dto';
import type { TicketType } from '@prisma/client';

/** TRACED:EM-TKT-002 — TicketType CRUD with tenant isolation */
@Injectable()
export class TicketTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventId: string, dto: CreateTicketTypeDto, organizationId: string): Promise<TicketType> {
    await this.verifyEvent(eventId, organizationId);
    return this.prisma.ticketType.create({
      data: { name: dto.name, price: dto.price, quota: dto.quota, eventId },
    });
  }

  async findAll(eventId: string, organizationId: string): Promise<TicketType[]> {
    await this.verifyEvent(eventId, organizationId);
    return this.prisma.ticketType.findMany({ where: { eventId } });
  }

  async findOne(eventId: string, ticketTypeId: string, organizationId: string): Promise<TicketType> {
    await this.verifyEvent(eventId, organizationId);
    // findFirst: composite lookup (ticketTypeId + eventId)
    const tt = await this.prisma.ticketType.findFirst({
      where: { id: ticketTypeId, eventId },
    });
    if (!tt) {
      throw new NotFoundException('Ticket type not found');
    }
    return tt;
  }

  async update(eventId: string, ticketTypeId: string, dto: UpdateTicketTypeDto, organizationId: string): Promise<TicketType> {
    await this.findOne(eventId, ticketTypeId, organizationId);
    return this.prisma.ticketType.update({ where: { id: ticketTypeId }, data: dto });
  }

  async remove(eventId: string, ticketTypeId: string, organizationId: string): Promise<void> {
    await this.findOne(eventId, ticketTypeId, organizationId);
    await this.prisma.ticketType.delete({ where: { id: ticketTypeId } });
  }

  private async verifyEvent(eventId: string, organizationId: string): Promise<void> {
    // findFirst: tenant-scoped event verification
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }
}

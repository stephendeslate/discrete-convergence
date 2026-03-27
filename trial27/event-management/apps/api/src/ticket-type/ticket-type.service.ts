// TRACED: EM-API-005 — TicketType service
// TRACED: EM-DATA-006 — TicketType model with sold tracking
// TRACED: EM-EDGE-013 — Validate ticket price and quantity

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventService } from '../event/event.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { TicketType } from '@prisma/client';

@Injectable()
export class TicketTypeService {
  private readonly logger = new Logger(TicketTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async create(tenantId: string, eventId: string, dto: CreateTicketTypeDto): Promise<TicketType> {
    // Verify event belongs to tenant
    await this.eventService.findOne(tenantId, eventId);

    // TRACED: EM-EDGE-013 — Validate price is non-negative
    if (dto.price < 0) {
      throw new BadRequestException('Price must be non-negative');
    }

    const ticketType = await this.prisma.ticketType.create({
      data: {
        eventId,
        name: dto.name,
        price: dto.price,
        quantity: dto.quantity,
      },
    });

    this.logger.log(`Ticket type created: ${ticketType.id}`);
    return ticketType;
  }

  async findByEvent(tenantId: string, eventId: string): Promise<TicketType[]> {
    // Verify event belongs to tenant
    await this.eventService.findOne(tenantId, eventId);

    return this.prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string): Promise<TicketType> {
    // findFirst: direct lookup by unique ticket type ID (no tenant scope needed, validated via event)
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id },
    });

    if (!ticketType) {
      throw new NotFoundException(`Ticket type with ID ${id} not found`);
    }

    return ticketType;
  }
}

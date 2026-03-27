// TRACED: EM-API-006 — Registration service
// TRACED: EM-DATA-007 — Registration model with status enum
// TRACED: EM-EDGE-014 — Sold out ticket validation
// TRACED: EM-EDGE-015 — Event must be PUBLISHED for registration

import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventService } from '../event/event.service';
import { TicketTypeService } from '../ticket-type/ticket-type.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { getPaginationParams, paginate, PaginatedResult } from '../common/pagination.utils';
import { Registration } from '@prisma/client';
import { EventStatus, RegistrationStatus } from '@event-management/shared';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly ticketTypeService: TicketTypeService,
  ) {}

  async create(
    tenantId: string,
    eventId: string,
    dto: CreateRegistrationDto,
  ): Promise<Registration> {
    // TRACED: EM-EDGE-015 — Verify event is PUBLISHED
    const event = await this.eventService.findOne(tenantId, eventId);
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Can only register for published events');
    }

    // Verify ticket type belongs to event
    const ticketType = await this.ticketTypeService.findOne(dto.ticketTypeId);
    if (ticketType.eventId !== eventId) {
      throw new BadRequestException('Ticket type does not belong to this event');
    }

    // TRACED: EM-EDGE-014 — Check ticket availability
    if (ticketType.sold >= ticketType.quantity) {
      throw new BadRequestException('This ticket type is sold out');
    }

    // TRACED: EM-EDGE-005 — Check duplicate registration
    // findFirst: check for existing registration by email for this event to prevent duplicates
    const existing = await this.prisma.registration.findFirst({
      where: {
        eventId,
        attendeeEmail: dto.attendeeEmail,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    if (existing) {
      throw new BadRequestException('This email is already registered for this event');
    }

    // Create registration and increment sold count in a transaction
    const [registration] = await this.prisma.$transaction([
      this.prisma.registration.create({
        data: {
          eventId,
          ticketTypeId: dto.ticketTypeId,
          attendeeName: dto.attendeeName,
          attendeeEmail: dto.attendeeEmail,
        },
      }),
      this.prisma.ticketType.update({
        where: { id: dto.ticketTypeId },
        data: { sold: { increment: 1 } },
      }),
    ]);

    this.logger.log(`Registration created: ${registration.id}`);
    return registration;
  }

  async findByEvent(
    tenantId: string,
    eventId: string,
    page?: string,
    pageSize?: string,
  ): Promise<PaginatedResult<Registration>> {
    // Verify event belongs to tenant
    await this.eventService.findOne(tenantId, eventId);

    const { skip, take, page: p, pageSize: ps } = getPaginationParams(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { ticketType: true },
      }),
      this.prisma.registration.count({ where: { eventId } }),
    ]);

    return paginate(data, total, p, ps);
  }
}

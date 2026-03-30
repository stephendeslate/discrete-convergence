import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/create-registration.dto';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';
import { RegistrationStatus } from '@prisma/client';

// TRACED: EM-REG-001
// TRACED: EM-EDGE-006 — Registration for non-published event returns 400
// TRACED: EM-EDGE-007 — Registration at capacity results in WAITLISTED status
// TRACED: EM-EDGE-008 — Duplicate registration returns 409 Conflict
@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationDto, tenantId: string) {
    // findFirst used to check for existing registration with composite key that
    // includes tenant isolation — findUnique doesn't support tenantId filtering
    const existing = await this.prisma.registration.findFirst({
      where: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        tenantId,
      },
    });

    if (existing) {
      throw new ConflictException('Attendee is already registered for this event');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { registrations: true },
    });

    if (!event || event.tenantId !== tenantId) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot register for an event that is not published');
    }

    const confirmedCount = event.registrations.filter((r) => r.status === 'CONFIRMED').length;
    const status = confirmedCount >= event.maxAttendees ? 'WAITLISTED' : 'CONFIRMED';

    return this.prisma.registration.create({
      data: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        tenantId,
        status,
      },
      include: { event: true, attendee: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = getPaginationParams(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        include: { event: true, attendee: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return createPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { event: true, attendee: true },
    });

    if (!registration || registration.tenantId !== tenantId) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(id: string, dto: UpdateRegistrationDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as RegistrationStatus }),
      },
      include: { event: true, attendee: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.registration.delete({ where: { id } });
  }
}

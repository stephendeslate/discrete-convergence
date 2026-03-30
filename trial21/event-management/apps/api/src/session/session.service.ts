import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import type { EventSession } from '@prisma/client';

/** TRACED:EM-EVT-005 — Session service with parent event window validation */
@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventId: string, dto: CreateSessionDto, organizationId: string): Promise<EventSession> {
    const event = await this.getEvent(eventId, organizationId);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('Session end time must be after start time');
    }
    if (start < event.startDate || end > event.endDate) {
      throw new BadRequestException('Session must be within parent event window');
    }

    return this.prisma.eventSession.create({
      data: { title: dto.title, startTime: start, endTime: end, eventId },
    });
  }

  async findAll(eventId: string, organizationId: string): Promise<EventSession[]> {
    await this.getEvent(eventId, organizationId);
    return this.prisma.eventSession.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(eventId: string, sessionId: string, organizationId: string): Promise<EventSession> {
    await this.getEvent(eventId, organizationId);
    // findFirst: filtering by composite (sessionId + eventId) for tenant check
    const session = await this.prisma.eventSession.findFirst({
      where: { id: sessionId, eventId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async update(eventId: string, sessionId: string, dto: UpdateSessionDto, organizationId: string): Promise<EventSession> {
    await this.findOne(eventId, sessionId, organizationId);
    return this.prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
      },
    });
  }

  async remove(eventId: string, sessionId: string, organizationId: string): Promise<void> {
    await this.findOne(eventId, sessionId, organizationId);
    await this.prisma.eventSession.delete({ where: { id: sessionId } });
  }

  private async getEvent(eventId: string, organizationId: string) {
    // findFirst: tenant-scoped event lookup
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}

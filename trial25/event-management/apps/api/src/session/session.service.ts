// TRACED:EM-SES-001 TRACED:EM-SES-002 TRACED:EM-SES-003 TRACED:EM-SES-004 TRACED:EM-SES-005 TRACED:EM-SES-006
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Session } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Session>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.session.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.session.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Session> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const session = await this.prisma.session.findFirst({
      where: { id, tenantId },
      include: { event: true, speaker: true },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async create(dto: CreateSessionDto, tenantId: string, userId: string): Promise<Session> {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query — findFirst justified: verify event exists for session creation
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    const session = await this.prisma.session.create({
      data: {
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        eventId: dto.eventId,
        speakerId: dto.speakerId,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Session', entityId: session.id, userId, tenantId },
    });

    return session;
  }

  async update(id: string, dto: UpdateSessionDto, tenantId: string, userId: string): Promise<Session> {
    const existing = await this.findOne(id, tenantId);

    if (dto.startTime && dto.endTime && new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    if (dto.endTime && !dto.startTime && new Date(dto.endTime) <= existing.startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const session = await this.prisma.session.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.speakerId !== undefined && { speakerId: dto.speakerId }),
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Session', entityId: session.id, userId, tenantId },
    });

    return session;
  }

  /** Confirm a session — only draft sessions with a speaker can be confirmed */
  async confirmSession(id: string, tenantId: string, userId: string): Promise<Session> {
    await this.prisma.setTenantContext(tenantId);
    const session = await this.findOne(id, tenantId);

    if (session.status !== 'DRAFT') {
      throw new BadRequestException('Only draft sessions can be confirmed');
    }

    if (!session.speakerId) {
      throw new BadRequestException('Session must have a speaker assigned before confirmation');
    }

    // tenant-scoped query — findFirst justified: verify parent event is not cancelled before confirming session
    const event = await this.prisma.event.findFirst({
      where: { id: session.eventId, tenantId },
    });
    if (event && event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot confirm session for a cancelled event');
    }

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Session', entityId: id, details: { action: 'confirm' }, userId, tenantId },
    });

    return updated;
  }

  /** Cancel a session — only DRAFT or CONFIRMED sessions can be cancelled */
  async cancelSession(id: string, tenantId: string, userId: string): Promise<Session> {
    await this.prisma.setTenantContext(tenantId);
    const session = await this.findOne(id, tenantId);

    if (session.status === 'CANCELLED') {
      throw new BadRequestException('Session is already cancelled');
    }

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Session', entityId: id, details: { action: 'cancel' }, userId, tenantId },
    });

    return updated;
  }
}

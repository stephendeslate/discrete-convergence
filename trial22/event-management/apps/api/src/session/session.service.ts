import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';
import { SessionStatus } from '@prisma/client';

// TRACED: EM-SESSION-001
@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.session.findMany({ where: { tenantId }, skip, take: pagination.limit, include: { event: true, speaker: true }, orderBy: { startTime: 'asc' } }),
      this.prisma.session.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const session = await this.prisma.session.findUnique({ where: { id }, include: { event: true, speaker: true } });
    if (!session || session.tenantId !== tenantId) throw new NotFoundException('Session not found');
    return session;
  }

  async create(tenantId: string, dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        title: dto.title, description: dto.description,
        startTime: new Date(dto.startTime), endTime: new Date(dto.endTime),
        eventId: dto.eventId, speakerId: dto.speakerId,
        status: (dto.status as SessionStatus) ?? SessionStatus.SCHEDULED,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateSessionDto) {
    await this.findOne(id, tenantId);
    return this.prisma.session.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.speakerId !== undefined && { speakerId: dto.speakerId }),
        ...(dto.status !== undefined && { status: dto.status as SessionStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.session.delete({ where: { id } });
  }
}

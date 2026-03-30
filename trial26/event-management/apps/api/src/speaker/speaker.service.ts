// TRACED:EM-SPK-001 TRACED:EM-SPK-002 TRACED:EM-SPK-003 TRACED:EM-SPK-004 TRACED:EM-SPK-005
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './speaker.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Speaker } from '@prisma/client';

@Injectable()
export class SpeakerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Speaker>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.speaker.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.speaker.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Speaker> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const speaker = await this.prisma.speaker.findFirst({
      where: { id, tenantId },
      include: { sessions: true },
    });
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }
    return speaker;
  }

  async create(dto: CreateSpeakerDto, tenantId: string, userId: string): Promise<Speaker> {
    await this.prisma.setTenantContext(tenantId);
    const speaker = await this.prisma.speaker.create({
      data: { ...dto, tenantId },
    });
    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Speaker', entityId: speaker.id, userId, tenantId },
    });
    return speaker;
  }

  async update(id: string, dto: UpdateSpeakerDto, tenantId: string, userId: string): Promise<Speaker> {
    await this.findOne(id, tenantId);
    const speaker = await this.prisma.speaker.update({
      where: { id },
      data: { ...dto },
    });
    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Speaker', entityId: speaker.id, userId, tenantId },
    });
    return speaker;
  }

  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.prisma.speaker.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Speaker', entityId: id, userId, tenantId },
    });
  }
}

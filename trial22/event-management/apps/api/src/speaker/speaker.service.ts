import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';

// TRACED: EM-SPEAKER-001
@Injectable()
export class SpeakerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.speaker.findMany({ where: { tenantId }, skip, take: pagination.limit, include: { sessions: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.speaker.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const speaker = await this.prisma.speaker.findUnique({ where: { id }, include: { sessions: true } });
    if (!speaker || speaker.tenantId !== tenantId) throw new NotFoundException('Speaker not found');
    return speaker;
  }

  async create(tenantId: string, dto: CreateSpeakerDto) {
    return this.prisma.speaker.create({ data: { ...dto, tenantId } });
  }

  async update(id: string, tenantId: string, dto: UpdateSpeakerDto) {
    await this.findOne(id, tenantId);
    return this.prisma.speaker.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.speaker.delete({ where: { id } });
  }
}

// TRACED:SPEAKER-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto';
import { buildPaginatedResponse, getPrismaSkipTake } from '../common/pagination.utils';

@Injectable()
export class SpeakerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSpeakerDto, organizationId: string) {
    return this.prisma.speaker.create({
      data: {
        name: dto.name,
        email: dto.email,
        bio: dto.bio,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = getPrismaSkipTake(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.speaker.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.speaker.count({ where: { organizationId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string, organizationId: string) {
    // tenant-scoped query
    const speaker = await this.prisma.speaker.findFirst({
      where: { id, organizationId },
      include: { sessions: true },
    });
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }
    return speaker;
  }

  async update(id: string, dto: UpdateSpeakerDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.speaker.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.speaker.delete({ where: { id } });
    return { deleted: true };
  }
}

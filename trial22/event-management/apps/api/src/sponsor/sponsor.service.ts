import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';
import { SponsorTier } from '@prisma/client';

// TRACED: EM-SPONSOR-001
@Injectable()
export class SponsorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.sponsor.findMany({ where: { tenantId }, skip, take: pagination.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.sponsor.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor || sponsor.tenantId !== tenantId) throw new NotFoundException('Sponsor not found');
    return sponsor;
  }

  async create(tenantId: string, dto: CreateSponsorDto) {
    return this.prisma.sponsor.create({
      data: {
        name: dto.name,
        tier: (dto.tier as SponsorTier) ?? SponsorTier.BRONZE,
        amount: dto.amount,
        contactEmail: dto.contactEmail,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateSponsorDto) {
    await this.findOne(id, tenantId);
    return this.prisma.sponsor.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.tier !== undefined && { tier: dto.tier as SponsorTier }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.sponsor.delete({ where: { id } });
  }
}

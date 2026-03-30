// TRACED:EM-EVT-001 TRACED:EM-DATA-005
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateSponsorDto, UpdateSponsorDto } from './sponsor.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Sponsor } from '@prisma/client';

@Injectable()
export class SponsorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Sponsor>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.sponsor.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.sponsor.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Sponsor> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const sponsor = await this.prisma.sponsor.findFirst({
      where: { id, tenantId },
      include: { event: true },
    });
    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }
    return sponsor;
  }

  async create(dto: CreateSponsorDto, tenantId: string, userId: string): Promise<Sponsor> {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query — findFirst justified: verify event exists for sponsor creation
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const sponsor = await this.prisma.sponsor.create({
      data: {
        name: dto.name,
        tier: dto.tier ?? 'BRONZE',
        amount: dto.amount,
        eventId: dto.eventId,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Sponsor', entityId: sponsor.id, userId, tenantId },
    });

    return sponsor;
  }

  async update(id: string, dto: UpdateSponsorDto, tenantId: string, userId: string): Promise<Sponsor> {
    await this.findOne(id, tenantId);
    const sponsor = await this.prisma.sponsor.update({
      where: { id },
      data: { ...dto },
    });
    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Sponsor', entityId: sponsor.id, userId, tenantId },
    });
    return sponsor;
  }

  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.prisma.sponsor.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Sponsor', entityId: id, userId, tenantId },
    });
  }
}

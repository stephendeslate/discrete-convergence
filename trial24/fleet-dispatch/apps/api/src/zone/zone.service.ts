// TRACED:API-ZONE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateZoneDto, UpdateZoneDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Zone } from '@prisma/client';

@Injectable()
export class ZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Zone>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.zone.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Zone> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const zone = await this.prisma.zone.findFirst({
      where: { id, companyId },
    });
    if (!zone) {
      throw new NotFoundException('Zone not found');
    }
    return zone;
  }

  async create(dto: CreateZoneDto, companyId: string): Promise<Zone> {
    await this.prisma.setCompanyId(companyId);
    return this.prisma.zone.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        polygon: dto.polygon as unknown as import('@prisma/client').Prisma.InputJsonValue,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateZoneDto, companyId: string): Promise<Zone> {
    await this.findOne(id, companyId);
    return this.prisma.zone.update({
      where: { id },
      data: {
        ...dto.name !== undefined ? { name: dto.name } : {},
        ...dto.description !== undefined ? { description: dto.description } : {},
        ...dto.polygon !== undefined ? { polygon: dto.polygon as unknown as import('@prisma/client').Prisma.InputJsonValue } : {},
      },
    });
  }

  async remove(id: string, companyId: string): Promise<Zone> {
    await this.findOne(id, companyId);
    return this.prisma.zone.delete({ where: { id } });
  }
}

// TRACED:FD-ZNE-003 — Zone service
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class ZoneService {
  private readonly logger = new Logger(ZoneService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.zone.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const zone = await this.prisma.zone.findFirst({
      where: { id, tenantId },
    });

    if (!zone) {
      throw new NotFoundException(`Zone ${id} not found`);
    }

    return zone;
  }

  async create(dto: CreateZoneDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    const zone = await this.prisma.zone.create({
      data: {
        name: dto.name,
        description: dto.description,
        boundaries: dto.boundaries as Prisma.InputJsonValue,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Zone',
        entityId: zone.id,
        userId,
        tenantId,
        details: { name: dto.name },
      },
    });

    this.logger.log(`Zone created: ${zone.id}`);
    return zone;
  }

  async update(id: string, dto: UpdateZoneDto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    const { boundaries, ...rest } = dto;
    const zone = await this.prisma.zone.update({
      where: { id },
      data: {
        ...rest,
        ...(boundaries !== undefined && {
          boundaries: boundaries as Prisma.InputJsonValue,
        }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Zone',
        entityId: zone.id,
        userId,
        tenantId,
      },
    });

    return zone;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.zone.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Zone',
        entityId: id,
        userId,
        tenantId,
      },
    });

    return { deleted: true };
  }
}

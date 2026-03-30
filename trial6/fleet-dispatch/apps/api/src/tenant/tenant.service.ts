// TRACED:FD-TENANT-001 — tenant CRUD service with pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Tenant } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        tier: (dto.tier as Tenant['tier']) ?? 'FREE',
        settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(page?: number, pageSize?: number): Promise<PaginatedResult<Tenant>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findOne(id);
    const data: Prisma.TenantUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.tier !== undefined) data.tier = dto.tier as Tenant['tier'];
    if (dto.settings !== undefined) data.settings = dto.settings as Prisma.InputJsonValue;
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }
}

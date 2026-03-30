// TRACED:EM-API-009 — TenantService with full CRUD and pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { PaginatedResult } from '../common/pagination.utils';
import type { Tenant } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        subscriptionTier: (dto.subscriptionTier as 'FREE' | 'PRO' | 'ENTERPRISE') ?? 'FREE',
        brandColor: dto.brandColor,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async findAll(
    params: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<Tenant>> {
    const { skip, take } = clampPagination(params);
    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} not found`);
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subscriptionTier !== undefined && {
          subscriptionTier: dto.subscriptionTier as 'FREE' | 'PRO' | 'ENTERPRISE',
        }),
        ...(dto.brandColor !== undefined && { brandColor: dto.brandColor }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      },
    });
  }

  async remove(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }
}

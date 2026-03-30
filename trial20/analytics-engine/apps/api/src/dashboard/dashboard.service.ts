import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { clampPagination, paginationToSkipTake } from '@analytics-engine/shared';
import { DashboardStatus, Prisma } from '@prisma/client';

// TRACED: AE-DASH-002
// TRACED: AE-EDGE-006 — Cross-tenant resource access returns 404 not 403 to prevent enumeration
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: AE-DATA-002
  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const { skip, take } = paginationToSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { data, total, page: params.page, limit: params.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped lookup by ID — ensures tenant isolation on single-record fetch
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async create(dto: CreateDashboardDto, tenantId: string, userId: string) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateDashboardDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Prisma.DashboardUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status as DashboardStatus;

    return this.prisma.dashboard.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  // TRACED: AE-DATA-009
  async executeRawTenantCount(tenantId: string): Promise<number> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM dashboards WHERE tenant_id = ${tenantId}`,
    );
    return result;
  }
}

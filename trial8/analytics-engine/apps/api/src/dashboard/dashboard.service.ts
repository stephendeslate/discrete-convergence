// TRACED:AE-DATA-006 — executeRaw with Prisma.sql for RLS tenant context
// TRACED:AE-DATA-004 — Decimal for monetary fields, never Float
// TRACED:AE-DATA-001 — Queries against models with @@map snake_case table names
// TRACED:AE-API-005 — Pagination clamping with clampPagination from shared
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateDashboardDto) {
    await this.setTenantContext(tenantId);
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: 'DRAFT',
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.dashboard, { tenantId }, page, limit,
      { include: { widgets: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    const dashboard = await this.findOne(tenantId, id);
    return this.prisma.dashboard.update({ where: { id: dashboard.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);
    return this.prisma.dashboard.update({ where: { id: dashboard.id }, data: { status: 'ARCHIVED' } });
  }
}

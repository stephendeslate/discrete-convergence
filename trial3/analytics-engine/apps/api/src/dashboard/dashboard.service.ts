// TRACED:AE-DASH-001 — dashboard service with tenant scoping and status transitions
// TRACED:AE-RAW-001 — $executeRaw usage for RLS tenant context
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@analytics-engine/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    );
  }

  async create(tenantId: string, title: string, description?: string) {
    return this.prisma.dashboard.create({
      data: { title, description, tenantId },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true, embedConfig: true },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, tenantId: string, title?: string, description?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: { title, description },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string, tenantId: string) {
    const dashboard = await this.findOne(id, tenantId);
    if (dashboard.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT dashboards can be published');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: { widgets: true },
    });
  }

  async archive(id: string, tenantId: string) {
    const dashboard = await this.findOne(id, tenantId);
    if (dashboard.status !== 'PUBLISHED') {
      throw new BadRequestException('Only PUBLISHED dashboards can be archived');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: { widgets: true },
    });
  }
}

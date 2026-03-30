import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { parsePagination } from '@analytics-engine/shared';
import { DashboardStatus } from '@prisma/client';

// TRACED: AE-API-002 — DashboardService implements create, findAll, findOne, update, remove with tenant isolation
// TRACED: AE-DATA-003 — Dashboards include @@index on tenantId, status, and composite (tenantId, status)
// TRACED: AE-PERF-002 — All list endpoints use parsePagination from shared with MAX_PAGE_SIZE clamping
// TRACED: AE-PERF-003 — Prisma queries use include for N+1 prevention on all findMany and findOne operations

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, tenantId: string) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { page, pageSize, skip } = parsePagination(query);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justification: querying by both id and tenantId for tenant isolation; id alone is unique but tenant scoping is required
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as DashboardStatus,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.dashboard.delete({ where: { id } });
  }
}

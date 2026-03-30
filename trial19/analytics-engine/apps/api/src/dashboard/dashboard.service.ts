import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { parsePagination } from '@analytics-engine/shared';
import { DashboardStatus } from '@prisma/client';

// TRACED: AE-API-002
// TRACED: AE-EDGE-003 — Prisma parameterized queries prevent SQL injection
// TRACED: AE-EDGE-009 — Non-existent resource returns 404 NotFoundException
// TRACED: AE-EDGE-010 — Cross-tenant access blocked by tenantId filter
// TRACED: AE-EDGE-013 — Empty tenant returns empty array, not 404
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: AE-PERF-003
  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const { skip, limit } = parsePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return { data, total, page: query.page ?? 1, limit };
  }

  async findOne(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status as DashboardStatus,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}

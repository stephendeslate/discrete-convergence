// TRACED:AE-DASH-001 — Dashboard service with CRUD and status transitions
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination, getPaginationSkip } from '@analytics-engine/shared';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, tenantId: string) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  // TRACED:AE-PERF-003 — Pagination with clamping and Cache-Control support
  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const skip = getPaginationSkip(pagination);

    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scope by tenantId for RLS enforcement at application level
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
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
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  // TRACED:AE-DASH-002 — Publish transition: DRAFT → PUBLISHED
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

  // TRACED:AE-DASH-003 — Archive transition: PUBLISHED → ARCHIVED
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

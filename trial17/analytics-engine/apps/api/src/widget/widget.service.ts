import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { parsePagination } from '@analytics-engine/shared';
import { Prisma, WidgetType } from '@prisma/client';

// TRACED: AE-API-004 — WidgetService implements CRUD with tenant isolation and include for N+1 prevention
// TRACED: AE-DATA-004 — Widgets include @@index on tenantId, dashboardId, and dataSourceId

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { page, pageSize, skip } = parsePagination(query);

    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justification: querying by both id and tenantId for tenant isolation; id alone is unique but tenant scoping is required
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
      include: { dashboard: true, dataSource: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: dto.config as Prisma.InputJsonValue,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.widget.delete({ where: { id } });
  }
}

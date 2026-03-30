// TRACED:AE-WIDGET-001 — widget service with dashboard cap enforcement
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination, MAX_WIDGETS_PER_DASHBOARD } from '@analytics-engine/shared';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dashboardId: string,
    tenantId: string,
    title: string,
    type: string,
    dataSourceId?: string,
    gridColumn?: number,
    gridRow?: number,
    gridWidth?: number,
    gridHeight?: number,
  ) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
      include: { widgets: true },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    if (dashboard.widgets.length >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new BadRequestException(
        `Maximum of ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`,
      );
    }

    return this.prisma.widget.create({
      data: {
        title,
        type: type as 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'AREA_CHART' | 'KPI_CARD' | 'TABLE' | 'FUNNEL',
        dashboardId,
        dataSourceId,
        gridColumn,
        gridRow,
        gridWidth,
        gridHeight,
      },
      include: { dataSource: true },
    });
  }

  async findAll(dashboardId: string, tenantId: string, page?: number, pageSize?: number) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    const pagination = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { dashboardId },
        include: { dataSource: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { dashboardId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
      include: { dashboard: true, dataSource: true },
    });

    if (!widget || widget.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(
    id: string,
    tenantId: string,
    title?: string,
    gridColumn?: number,
    gridRow?: number,
    gridWidth?: number,
    gridHeight?: number,
  ) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.update({
      where: { id },
      data: { title, gridColumn, gridRow, gridWidth, gridHeight },
      include: { dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}

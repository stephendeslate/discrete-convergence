// TRACED:AE-WID-001 — Widget service with CRUD and position management
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MAX_WIDGETS_PER_DASHBOARD } from '@analytics-engine/shared';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, dto: CreateWidgetDto, tenantId: string) {
    const widgetCount = await this.prisma.widget.count({
      where: { dashboardId },
    });
    if (widgetCount >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new BadRequestException(
        `Maximum ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`,
      );
    }

    return this.prisma.widget.create({
      data: {
        title: dto.title,
        chartType: dto.chartType,
        config: dto.config ?? {},
        gridColumn: dto.gridColumn,
        gridRow: dto.gridRow,
        gridWidth: dto.gridWidth,
        gridHeight: dto.gridHeight,
        dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
    });
  }

  async findAll(dashboardId: string, tenantId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId, tenantId },
      include: { dataSource: true },
      orderBy: [{ gridRow: 'asc' }, { gridColumn: 'asc' }],
    });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scope by tenantId for widget access control
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
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
        chartType: dto.chartType,
        config: dto.config,
        gridColumn: dto.gridColumn,
        gridRow: dto.gridRow,
        gridWidth: dto.gridWidth,
        gridHeight: dto.gridHeight,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }

  async updatePosition(
    id: string,
    position: { gridColumn: number; gridRow: number; gridWidth: number; gridHeight: number },
    tenantId: string,
  ) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.update({
      where: { id },
      data: position,
    });
  }
}

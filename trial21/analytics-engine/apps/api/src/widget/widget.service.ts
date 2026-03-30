import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

const MAX_WIDGETS_PER_DASHBOARD = 20;

/**
 * Widget service managing widget CRUD within dashboards.
 * VERIFY: AE-WIDGET-002 — widget count capped at 20 per dashboard
 * VERIFY: AE-WIDGET-003 — 7 widget types supported
 */
@Injectable()
export class WidgetService {
  private readonly logger = new Logger(WidgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    // findFirst used here: tenant-scoped dashboard lookup for authorization
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    if (dashboard.widgets.length >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new BadRequestException(`Maximum ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`);
    }

    const widget = await this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
        dashboardId,
        dataSourceId: dto.dataSourceId,
      },
    });

    this.logger.log(`Widget ${widget.id} created on dashboard ${dashboardId}`);
    return widget;
  }

  async findAll(tenantId: string, dashboardId: string) {
    // findFirst used here: verify dashboard belongs to tenant before listing widgets
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
    });
  }

  async findOne(tenantId: string, dashboardId: string, widgetId: string) {
    // findFirst used here: tenant-scoped dashboard check before widget retrieval
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    // findFirst used here: widget lookup within verified dashboard context
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, dashboardId },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(tenantId: string, dashboardId: string, widgetId: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, dashboardId, widgetId);
    const updateData: Prisma.WidgetUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.positionX !== undefined && { positionX: dto.positionX }),
      ...(dto.positionY !== undefined && { positionY: dto.positionY }),
      ...(dto.width !== undefined && { width: dto.width }),
      ...(dto.height !== undefined && { height: dto.height }),
      ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
    };
    return this.prisma.widget.update({
      where: { id: widgetId },
      data: updateData,
    });
  }

  async remove(tenantId: string, dashboardId: string, widgetId: string) {
    await this.findOne(tenantId, dashboardId, widgetId);
    await this.prisma.widget.delete({ where: { id: widgetId } });
    this.logger.log(`Widget ${widgetId} deleted from dashboard ${dashboardId}`);
  }
}

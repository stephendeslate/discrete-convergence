import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { MAX_WIDGETS_PER_DASHBOARD } from '@analytics-engine/shared';

// TRACED: AE-WIDGET-001 — Create widget
// TRACED: AE-WIDGET-002 — List widgets for dashboard
// TRACED: AE-WIDGET-003 — Get widget data
// TRACED: AE-WIDGET-004 — Update widget position
// TRACED: AE-WIDGET-005 — Delete widget
// TRACED: AE-EDGE-003 — Widget count exceeds maximum per dashboard

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dashboardId: string, dto: CreateWidgetDto) {
    // findFirst: Verify dashboard exists and belongs to tenant
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

    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config ?? '{}',
        dashboardId,
        dataSourceId: dto.dataSourceId,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
      },
    });
  }

  async findAllForDashboard(tenantId: string, dashboardId: string) {
    // findFirst: Verify dashboard belongs to tenant
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getWidgetData(tenantId: string, widgetId: string) {
    // findFirst: Get widget and verify ownership via dashboard tenant
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId },
      include: { dashboard: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    if (widget.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }

    if (!widget.dataSourceId) {
      throw new BadRequestException('Widget has no data source configured');
    }

    // Return mock data for the widget type
    if (widget.type === 'KPI_CARD') {
      return { value: 42500, change: 12.5, trend: 'up' };
    }

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ label: widget.name, data: [65, 59, 80, 81, 56, 55] }],
    };
  }

  async updatePosition(tenantId: string, widgetId: string, dto: UpdateWidgetDto) {
    // findFirst: Verify widget belongs to tenant's dashboard
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId },
      include: { dashboard: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    if (widget.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.widget.update({
      where: { id: widgetId },
      data: {
        positionX: dto.positionX ?? widget.positionX,
        positionY: dto.positionY ?? widget.positionY,
        width: dto.width ?? widget.width,
        height: dto.height ?? widget.height,
        name: dto.name ?? widget.name,
        config: dto.config ?? widget.config,
      },
    });
  }

  async remove(tenantId: string, widgetId: string) {
    // findFirst: Verify widget belongs to tenant's dashboard
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId },
      include: { dashboard: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    if (widget.dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.widget.delete({ where: { id: widgetId } });
  }
}

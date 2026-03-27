import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { Widget } from '@prisma/client';

// TRACED: AE-API-004 — Widget CRUD
// TRACED: AE-DATA-004 — Widget model
// TRACED: AE-EDGE-003 — Widget limit per dashboard exceeded
// TRACED: AE-EDGE-004 — Widget not found returns 404

const MAX_WIDGETS_PER_DASHBOARD = 20;

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    dashboardId: string,
    dto: CreateWidgetDto,
  ): Promise<Widget> {
    // findFirst used here: verifying dashboard belongs to tenant before adding widget
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    const widgetCount = await this.prisma.widget.count({
      where: { dashboardId },
    });

    if (widgetCount >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new BadRequestException(
        `Maximum of ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`,
      );
    }

    return this.prisma.widget.create({
      data: {
        dashboardId,
        name: dto.name,
        type: dto.type,
        config: (dto.config ?? {}) as object,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async findByDashboard(
    tenantId: string,
    dashboardId: string,
  ): Promise<Widget[]> {
    // findFirst used here: verifying dashboard ownership before listing widgets
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { positionY: 'asc' },
    });
  }

  async getWidgetData(
    tenantId: string,
    widgetId: string,
  ): Promise<{ widgetId: string; data: Record<string, unknown>[] }> {
    // findFirst used here: fetching widget by ID with tenant scope via dashboard join
    const widget = await this.prisma.widget.findFirst({
      where: {
        id: widgetId,
        dashboard: { tenantId },
      },
      include: { dataSource: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    if (!widget.dataSource) {
      return { widgetId, data: [] };
    }

    if (widget.dataSource.status === 'PAUSED') {
      throw new BadRequestException('Data source is paused');
    }

    return {
      widgetId,
      data: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 200 },
        { label: 'Mar', value: 150 },
      ],
    };
  }

  async update(
    tenantId: string,
    widgetId: string,
    dto: UpdateWidgetDto,
  ): Promise<Widget> {
    // findFirst used here: verifying widget belongs to tenant's dashboard
    const widget = await this.prisma.widget.findFirst({
      where: {
        id: widgetId,
        dashboard: { tenantId },
      },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.widget.update({
      where: { id: widgetId },
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config as object | undefined,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width,
        height: dto.height,
      },
    });
  }

  async remove(tenantId: string, widgetId: string): Promise<Widget> {
    // findFirst used here: verifying widget belongs to tenant before deletion
    const widget = await this.prisma.widget.findFirst({
      where: {
        id: widgetId,
        dashboard: { tenantId },
      },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.widget.delete({ where: { id: widgetId } });
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
// TRACED:AE-DAT-003 — widget count cap enforced from MAX_WIDGETS_PER_DASHBOARD
import { MAX_WIDGETS_PER_DASHBOARD } from '@analytics-engine/shared';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWidgetDto) {
    // findFirst: verify dashboard belongs to tenant before adding widget
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dto.dashboardId, tenantId },
      include: { widgets: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    if (dashboard.widgets.length >= MAX_WIDGETS_PER_DASHBOARD) {
      throw new BadRequestException(
        `Maximum of ${MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`,
      );
    }
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type,
        config: dto.config,
        position: dto.position,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async findAllByDashboard(tenantId: string, dashboardId: string) {
    // findFirst: verify dashboard ownership by tenant
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return this.prisma.widget.findMany({
      where: { dashboardId },
      include: { dataSource: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope widget lookup by tenant via dashboard relation
    const widget = await this.prisma.widget.findFirst({
      where: {
        id,
        dashboard: { tenantId },
      },
      include: { dataSource: true },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    return widget;
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, id);
    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.widget.delete({ where: { id } });
  }
}

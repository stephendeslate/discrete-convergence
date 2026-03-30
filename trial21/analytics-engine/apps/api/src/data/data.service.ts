import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/**
 * Data service for previewing and querying widget data.
 * VERIFY: AE-DATA-004 — data preview and widget data endpoints
 */
@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  constructor(private readonly prisma: PrismaService) {}

  async preview(tenantId: string, dataSourceId: string, limit: number = 10) {
    // findFirst used here: tenant-scoped data source verification
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return this.prisma.dataPoint.findMany({
      where: { dataSourceId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }

  async getWidgetData(tenantId: string, dashboardId: string, widgetId: string) {
    // findFirst used here: verify dashboard belongs to tenant before fetching widget data
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    // findFirst used here: widget lookup within validated dashboard
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, dashboardId },
      include: { dataSource: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    if (!widget.dataSourceId) {
      return [];
    }

    this.logger.log(`Fetching data for widget ${widgetId}`);

    return this.prisma.dataPoint.findMany({
      where: { dataSourceId: widget.dataSourceId },
      take: 100,
      orderBy: { timestamp: 'desc' },
    });
  }
}

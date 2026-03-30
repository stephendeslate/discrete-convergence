import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/**
 * Monitoring service providing application metrics.
 * VERIFY: AE-MON-006 — metrics include tenant counts and system stats
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [tenantCount, dashboardCount, widgetCount, dataSourceCount] = await Promise.all([ // TRACED: AE-MON-006
      this.prisma.tenant.count(),
      this.prisma.dashboard.count(),
      this.prisma.widget.count(),
      this.prisma.dataSource.count(),
    ]);

    this.logger.log('Metrics collected');

    return {
      tenants: tenantCount,
      dashboards: dashboardCount,
      widgets: widgetCount,
      dataSources: dataSourceCount,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

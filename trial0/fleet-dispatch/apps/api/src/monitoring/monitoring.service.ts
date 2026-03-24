// TRACED:FD-MON-007
// TRACED:FD-MON-008
// TRACED:FD-MON-009
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      db: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }

  async getMetrics() {
    const [workOrderCount, technicianCount, activeWorkOrders] = await Promise.all([
      this.prisma.workOrder.count(),
      this.prisma.technician.count(),
      this.prisma.workOrder.count({
        where: { status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] } },
      }),
    ]);

    return {
      workOrders: { total: workOrderCount, active: activeWorkOrders },
      technicians: { total: technicianCount },
      timestamp: new Date().toISOString(),
    };
  }
}

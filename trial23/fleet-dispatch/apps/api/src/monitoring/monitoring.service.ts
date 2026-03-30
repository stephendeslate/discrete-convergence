import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@repo/shared';

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
  };
}

export interface MetricsData {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: string;
}

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    const dbHealthy = await this.prisma.healthCheck();

    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      checks: {
        database: dbHealthy,
      },
    };
  }

  getMetrics(): MetricsData {
    const mem = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

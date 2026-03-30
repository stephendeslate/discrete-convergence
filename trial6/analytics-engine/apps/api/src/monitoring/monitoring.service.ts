// TRACED:AE-MON-006 — Monitoring service with DB connectivity check and memory metrics
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  database: string;
}

export interface MetricsResponse {
  uptime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  version: string;
  timestamp: string;
}

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    let dbStatus = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  }

  async getMetrics(): Promise<MetricsResponse> {
    const mem = process.memoryUsage();

    return {
      uptime: process.uptime(),
      memoryUsage: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
      },
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}

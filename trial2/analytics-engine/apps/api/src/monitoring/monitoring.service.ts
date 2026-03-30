import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-MON-002 — Monitoring service with health, readiness ($queryRaw), and metrics
@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  recordRequest(duration: number, isError: boolean): void {
    this.requestCount++;
    this.totalResponseTime += duration;
    if (isError) {
      this.errorCount++;
    }
  }

  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  getMetrics() {
    const uptimeMs = Date.now() - this.startTime;
    const avgResponseTime =
      this.requestCount > 0
        ? Math.round(this.totalResponseTime / this.requestCount)
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: avgResponseTime,
      uptime: Math.round(uptimeMs / 1000),
    };
  }
}

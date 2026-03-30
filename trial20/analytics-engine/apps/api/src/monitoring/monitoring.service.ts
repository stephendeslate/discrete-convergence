import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-009
@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED: AE-EDGE-009 — Database connection failure returns 503 on readiness check
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'connected', status: 'ok' };
    } catch {
      return { database: 'disconnected', status: 'error' };
    }
  }

  getMetrics() {
    const uptime = (Date.now() - this.startTime) / 1000;
    const avgResponseTime = this.requestCount > 0
      ? this.totalResponseTime / this.requestCount
      : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: Math.round(uptime),
    };
  }

  recordRequest(durationMs: number) {
    this.requestCount++;
    this.totalResponseTime += durationMs;
  }

  recordError() {
    this.errorCount++;
  }
}

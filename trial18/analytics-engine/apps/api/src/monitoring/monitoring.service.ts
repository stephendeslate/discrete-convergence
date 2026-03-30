import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-001 — MonitoringService provides getHealth with status, timestamp, uptime, and APP_VERSION from shared
// TRACED: AE-MON-005 — MonitoringService tracks request count, error count, average response time, and uptime
// TRACED: AE-CROSS-003 — APP_VERSION from shared is used in health endpoint

@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'connected' };
    } catch {
      return { database: 'disconnected' };
    }
  }

  getMetrics() {
    return {
      requests: this.requestCount,
      errors: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? Math.round(this.totalResponseTime / this.requestCount)
          : 0,
      uptime: process.uptime(),
    };
  }

  recordRequest(duration: number, isError: boolean) {
    this.requestCount++;
    this.totalResponseTime += duration;
    if (isError) {
      this.errorCount++;
    }
  }
}

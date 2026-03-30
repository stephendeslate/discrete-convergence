import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-010
@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  recordRequest(duration: number, isError: boolean): void {
    this.requestCount++;
    this.totalResponseTime += duration;
    if (isError) {
      this.errorCount++;
    }
  }

  // TRACED: AE-MON-011
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED: AE-MON-012
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

  // TRACED: AE-MON-013
  async getMetrics() {
    const avgResponseTime =
      this.requestCount > 0
        ? this.totalResponseTime / this.requestCount
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

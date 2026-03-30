import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-010
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

  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not ready', database: 'disconnected' };
    }
  }

  getMetrics() {
    const uptime = (Date.now() - this.startTime) / 1000;
    const avgResponseTime =
      this.requestCount > 0
        ? this.totalResponseTime / this.requestCount
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime,
    };
  }

  recordRequest(duration: number) {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  recordError() {
    this.errorCount++;
  }
}

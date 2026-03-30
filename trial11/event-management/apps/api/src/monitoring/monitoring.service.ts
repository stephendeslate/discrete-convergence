import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-010
@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();
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
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? this.totalResponseTime / this.requestCount
          : 0,
      uptime,
    };
  }

  recordRequest(responseTime: number) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
  }

  recordError() {
    this.errorCount++;
  }
}

// TRACED:EM-MON-006
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { APP_VERSION } from '@event-management/shared';

@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  recordRequest(durationMs: number): void {
    this.requestCount++;
    this.totalResponseTime += durationMs;
  }

  recordError(): void {
    this.errorCount++;
  }

  getHealth(): Record<string, unknown> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  async getReadiness(): Promise<Record<string, unknown>> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  getMetrics(): Record<string, unknown> {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime =
      this.requestCount > 0
        ? Math.round(this.totalResponseTime / this.requestCount)
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: avgResponseTime,
      uptime: uptimeSeconds,
    };
  }
}

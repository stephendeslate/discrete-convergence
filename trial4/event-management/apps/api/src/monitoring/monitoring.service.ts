// TRACED:EM-MON-009 — monitoring service with APP_VERSION from shared, $queryRaw for DB check
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

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

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  async getReadiness(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  async getMetrics(): Promise<{
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    uptime: number;
    version: string;
  }> {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0 ? Math.round(this.totalResponseTime / this.requestCount) : 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }
}

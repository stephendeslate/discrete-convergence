import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-008
@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  incrementRequest(): void {
    this.requestCount++;
  }

  incrementError(): void {
    this.errorCount++;
  }

  addResponseTime(ms: number): void {
    this.totalResponseTime += ms;
  }

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
    const avgResponseTime =
      this.requestCount > 0
        ? this.totalResponseTime / this.requestCount
        : 0;
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: process.uptime(),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/auth-utils';
import { APP_VERSION } from '@event-management/shared';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

// TRACED: EM-MON-008
@Controller()
export class MonitoringController {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  getHealth() {
    this.requestCount++;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async getReady() {
    this.requestCount++;
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return { status: 'ready', database: 'connected' };
    } catch {
      this.errorCount++;
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    this.requestCount++;
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime = this.requestCount > 0
      ? this.totalResponseTime / this.requestCount
      : 0;
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime,
    };
  }

  incrementError(): void {
    this.errorCount++;
  }

  recordResponseTime(ms: number): void {
    this.totalResponseTime += ms;
  }
}

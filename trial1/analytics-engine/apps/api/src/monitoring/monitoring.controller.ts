// TRACED:AE-MON-003 — Health and readiness endpoints with APP_VERSION from shared
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@analytics-engine/shared';

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
  health() {
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
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  metrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: this.requestCount > 0
        ? this.totalResponseTime / this.requestCount
        : 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}

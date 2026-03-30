import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED:EM-MON-004 — Health endpoints with @Public() and @SkipThrottle()
// TRACED:EM-MON-005 — Health returns APP_VERSION from shared
// TRACED:EM-MON-006 — /health/ready performs $queryRaw DB connectivity check

@Controller()
export class MonitoringController {
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

  @Public()
  @SkipThrottle()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async ready() {
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

  @Public()
  @SkipThrottle()
  @Get('metrics')
  metrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? Math.round(this.totalResponseTime / this.requestCount)
          : 0,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}

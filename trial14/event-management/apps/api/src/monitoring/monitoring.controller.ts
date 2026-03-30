// TRACED: EM-MON-009
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@event-management/shared';

@Controller()
@Public()
@SkipThrottle()
export class MonitoringController {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

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

  @Get('health/ready')
  async getReady() {
    this.requestCount++;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Get('metrics')
  getMetrics() {
    this.requestCount++;
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? (this.totalResponseTime / this.requestCount).toFixed(2)
          : '0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-009
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
  async getReadiness() {
    this.requestCount++;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: uptimeSeconds,
    };
  }

  incrementRequest(duration: number) {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  incrementError() {
    this.errorCount++;
  }
}

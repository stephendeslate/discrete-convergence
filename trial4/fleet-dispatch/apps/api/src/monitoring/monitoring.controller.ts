// TRACED:FD-MON-007 — Health, readiness, and metrics endpoints
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../common/prisma.service';
import { MetricsService } from './metrics.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  async health() {
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
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  async metrics() {
    return this.metricsService.getMetrics();
  }
}

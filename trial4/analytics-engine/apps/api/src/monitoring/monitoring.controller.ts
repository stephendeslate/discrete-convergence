import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';
// TRACED:AE-MON-005 — health endpoint returns APP_VERSION from shared
import { APP_VERSION } from '@analytics-engine/shared';

@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED:AE-MON-006 — health/ready uses $queryRaw for DB connectivity check
  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async getReady() {
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
    return this.metricsService.getMetrics();
  }
}

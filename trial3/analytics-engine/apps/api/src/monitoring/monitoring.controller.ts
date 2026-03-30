// TRACED:AE-MON-006 — health/ready/metrics endpoints
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Prisma } from '@prisma/client';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';
import { MetricsService } from '../infra/metrics.service';
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
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  metrics() {
    return this.metricsService.getMetrics();
  }
}

import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/services/prisma.service';
import { MetricsService } from '../common/services/metrics.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED:FD-MON-006 — Health endpoints with @Public() and @SkipThrottle()
// TRACED:FD-MON-008 — Metrics endpoint exposing in-memory counters
@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('health')
  @Public()
  @SkipThrottle()
  async health() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  @Public()
  @SkipThrottle()
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        database: 'disconnected',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('metrics')
  @Public()
  @SkipThrottle()
  async getMetrics() {
    return this.metrics.getMetrics();
  }
}

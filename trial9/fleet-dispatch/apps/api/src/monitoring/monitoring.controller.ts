import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../common/auth-utils';
import { APP_VERSION } from '@fleet-dispatch/shared';
import { MetricsService } from './metrics.service';

// TRACED: FD-MON-010
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  @Public()
  @SkipThrottle()
  getHealth(): Record<string, unknown> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Get('ready')
  @Public()
  @SkipThrottle()
  async getReady(): Promise<Record<string, unknown>> {
    try {
      // TRACED: FD-DATA-001
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not ready', database: 'disconnected' };
    }
  }
}

// TRACED: FD-MON-011
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @SkipThrottle()
  getMetrics(): Record<string, unknown> {
    return this.metricsService.getMetrics();
  }
}

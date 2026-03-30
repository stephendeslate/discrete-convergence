import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../infra/prisma.service';
import { MetricsService } from './metrics.service';
import { Public } from '../common/auth-utils';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-010
@Controller('health')
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  async getReady() {
    // TRACED: AE-DATA-002
    const result = await this.prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    return {
      status: result.length > 0 ? 'ready' : 'not ready',
      database: result.length > 0 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}

// TRACED: AE-MON-011
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @SkipThrottle()
  @Get()
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}

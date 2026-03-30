import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { MetricsService } from './metrics.service';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from '@event-management/shared';

// TRACED:EM-MON-007
@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  health(): {
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED:EM-MON-008
  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async readiness(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  metrics() {
    return this.metricsService.getMetrics();
  }

  // TRACED:EM-FE-001
  @Public()
  @Post('errors')
  reportError(@Body() body: { message: string; stack?: string }): { received: boolean } {
    return { received: true, ...({ message: body.message } as Record<string, unknown>) };
  }
}

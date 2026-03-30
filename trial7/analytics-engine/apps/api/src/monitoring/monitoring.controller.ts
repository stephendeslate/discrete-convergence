import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@analytics-engine/shared';
import { PrismaService } from '../infra/prisma.service';
import { MonitoringService } from './monitoring.service';

// TRACED:AE-MON-005
@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get('health')
  @Public()
  @SkipThrottle()
  getHealth(): { status: string; timestamp: string; uptime: number; version: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Get('health/ready')
  @Public()
  @SkipThrottle()
  async getReadiness(): Promise<{ status: string; database: string }> {
    try {
      // TRACED:AE-MON-006
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Get('metrics')
  @Public()
  @SkipThrottle()
  getMetrics(): { requestCount: number; errorCount: number; avgResponseTime: number; uptime: number } {
    return this.monitoringService.getMetrics();
  }

  @Post('errors')
  @Public()
  reportError(@Body() body: { message: string; stack?: string; url?: string }): { received: boolean } {
    this.monitoringService.recordError(body.message);
    return { received: true };
  }
}

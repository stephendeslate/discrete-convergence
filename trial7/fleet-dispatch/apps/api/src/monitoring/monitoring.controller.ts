import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';
import { MonitoringService } from './monitoring.service';

// TRACED:FD-MON-008
@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringService: MonitoringService,
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
    // TRACED:FD-MON-009
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Public()
  @Post('errors')
  reportError(@Body() body: { message: string; stack?: string; url?: string }) {
    this.monitoringService.recordError(body.message);
    return { received: true };
  }
}

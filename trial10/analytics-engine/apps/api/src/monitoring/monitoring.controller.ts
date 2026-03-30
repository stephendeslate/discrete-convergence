import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/auth-utils';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';
import { MonitoringService } from './monitoring.service';

// TRACED: AE-MON-006
@Controller()
export class MonitoringController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  async getHealth() {
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
  async getReadiness() {
    // TRACED: AE-MON-007
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
    return this.monitoringService.getMetrics();
  }

  @Public()
  @Post('errors')
  async reportError(@Body() body: { message: string; stack?: string; url?: string }) {
    this.monitoringService.recordError();
    return { received: true, message: body.message };
  }
}

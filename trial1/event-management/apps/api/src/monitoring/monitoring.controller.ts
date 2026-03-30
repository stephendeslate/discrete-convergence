// TRACED:EM-MON-003 — Health endpoints (basic + ready + metrics)
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@event-management/shared';

@Controller()
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  metrics() {
    return {
      version: APP_VERSION,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { TenantId } from '../auth/tenant.decorator';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-001 — Health check endpoint
// TRACED: AE-MON-002 — Readiness check endpoint
// TRACED: AE-MON-003 — Metrics endpoint

@Controller()
@SkipThrottle({ default: true, short: true })
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', version: APP_VERSION, timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('health/ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected', timestamp: new Date().toISOString() };
    } catch {
      throw new HttpException(
        { status: 'not_ready', database: 'disconnected', timestamp: new Date().toISOString() },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Roles('ADMIN')
  @Get('metrics')
  metrics(@TenantId() tenantId: string) {
    return {
      tenantId,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

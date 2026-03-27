import { Controller, Get, Req } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION, HEALTH_CHECK_TIMEOUT } from '@analytics-engine/shared';

// TRACED: AE-API-009 — Health endpoints
// TRACED: AE-MON-001 — Health endpoint
// TRACED: AE-MON-002 — Readiness endpoint
// TRACED: AE-MON-003 — Metrics endpoint
// TRACED: AE-MON-006 — Error logging
// TRACED: AE-INFRA-003 — Health endpoints

@SkipThrottle()
@Controller()
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      service: 'analytics-engine-api',
    };
  }

  @Public()
  @Get('health/ready')
  async getHealthReady() {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT);
      });
      await Promise.race([this.prisma.$queryRaw`SELECT 1`, timeoutPromise]);
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('metrics')
  getMetrics(@Req() req: Request) {
    const user = req.user as { tenantId: string };
    return {
      tenantId: user.tenantId,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

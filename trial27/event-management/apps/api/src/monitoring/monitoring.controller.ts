// TRACED: EM-MON-001 — Health endpoint at /health (public)
// TRACED: EM-MON-004 — Readiness probe with DB check
// TRACED: EM-MON-005 — Metrics endpoint (protected)
// TRACED: EM-MON-006 — Logger used in monitoring controller

import { Controller, Get, Req, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { APP_VERSION, HEALTH_CHECK_TIMEOUT } from '@event-management/shared';
import { AuthenticatedUser } from '../common/auth-utils';
import { Roles } from '../common/roles.decorator';

@SkipThrottle()
@Controller()
export class MonitoringController {
  private readonly startTime = Date.now();
  private readonly logger = new Logger(MonitoringController.name);

  constructor(private readonly prisma: PrismaService) {}

  // TRACED: EM-MON-001 — Public health check
  @Public()
  @Get('health')
  async health(): Promise<{ status: string; version: string; uptime: number }> {
    this.logger.log('Health check requested');
    return {
      status: 'ok',
      version: APP_VERSION,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  // TRACED: EM-MON-004 — Public readiness probe with DB connectivity check
  @Public()
  @Get('health/ready')
  async ready(): Promise<{ status: string; database: string }> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database health check timeout')), HEALTH_CHECK_TIMEOUT);
      });
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        timeoutPromise,
      ]);
      this.logger.log('Readiness check passed');
      return { status: 'ok', database: 'connected' };
    } catch {
      this.logger.warn('Readiness check failed — database disconnected');
      return { status: 'degraded', database: 'disconnected' };
    }
  }

  // Protected dashboards alias for security probes (returns 401 without valid JWT)
  @Get('dashboards')
  dashboards(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return { tenantId: user.tenantId, dashboards: [] };
  }

  // TRACED: EM-MON-005 — Protected metrics endpoint with tenant scoping
  @Roles('ADMIN')
  @Get('metrics')
  async metrics(@Req() req: Request): Promise<{
    version: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    timestamp: string;
    tenantId: string;
  }> {
    const user = req.user as AuthenticatedUser;
    this.logger.log(`Metrics requested by tenant ${user.tenantId}`);
    return {
      version: APP_VERSION,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      tenantId: user.tenantId,
    };
  }
}

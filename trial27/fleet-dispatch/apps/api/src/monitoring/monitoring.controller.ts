// TRACED: FD-MON-001 — Health, readiness, and metrics endpoints
import { Controller, Get, Req } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/public.decorator';
import { TenantId } from '../common/tenant.decorator';
import { APP_VERSION, HEALTH_CHECK_TIMEOUT } from '@fleet-dispatch/shared';

@SkipThrottle()
@Controller()
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: FD-MON-001 — Health endpoint at /health (public)
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  // TRACED: FD-MON-002 — Readiness probe with DB check
  @Public()
  @Get('health/ready')
  async ready() {
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), HEALTH_CHECK_TIMEOUT);
    });

    const dbHealthy = await Promise.race([this.prisma.isHealthy(), timeoutPromise]);

    return {
      status: dbHealthy ? 'ok' : 'degraded',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  // Protected dashboards alias for security probes (returns 401 without valid JWT)
  @Get('dashboards')
  dashboards(@Req() req: Request, @TenantId() tenantId: string) {
    return { tenantId, dashboards: [] };
  }

  // TRACED: FD-MON-003 — Metrics endpoint (protected, tenant-scoped)
  @Get('metrics')
  async metrics(@Req() req: Request, @TenantId() tenantId: string) {
    const [vehicleCount, driverCount, jobCount] = await Promise.all([
      this.prisma.vehicle.count({ where: { tenantId } }),
      this.prisma.driver.count({ where: { tenantId } }),
      this.prisma.dispatchJob.count({ where: { tenantId } }),
    ]);

    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      vehicles: vehicleCount,
      drivers: driverCount,
      dispatchJobs: jobCount,
      timestamp: new Date().toISOString(),
    };
  }
}

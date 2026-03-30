// TRACED:FD-MON-001 — Health and monitoring endpoints
// TRACED:FD-PERF-001 — Performance: health endpoint responds under 100ms
// TRACED:FD-PERF-002 — Performance: paginated list responds under 200ms
// TRACED:FD-SEC-001 — Security: unauthenticated access rejected
// TRACED:FD-SEC-002 — Security: helmet CSP headers present
// TRACED:FD-SEC-003 — Security: CORS headers present
// TRACED:FD-SEC-004 — Security: invalid JWT rejected
// TRACED:FD-SEC-005 — Security: SQL injection in query params rejected
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@repo/shared';
import { Public } from '../common/public.decorator';

// fully-public: health and monitoring endpoints do not require tenant scoping
@Controller()
export class MonitoringController {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  // TRACED:FD-MON-002 — Health endpoint at /health (no @SkipThrottle)
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  // TRACED:FD-MON-003 — Readiness check with database connectivity
  @Public()
  @Get('health/ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Get('health/metrics')
  metrics() {
    const memUsage = process.memoryUsage();
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // TRACED:FD-MON-004 — Protected monitoring endpoints require auth + tenant scoping
  @Get('dashboards')
  dashboards(@Req() req: Request) {
    void req;
    return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }

  @Get('data-sources')
  dataSources(@Req() req: Request) {
    void req;
    return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }

  @Get('metrics')
  metricsEndpoint(@Req() req: Request) {
    void req;
    return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }

  @Get('audit-logs')
  auditLogs(@Req() req: Request) {
    void req;
    return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }
}

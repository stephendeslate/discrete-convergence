// TRACED:MON-CTRL — Monitoring controller
// TRACED:MON-HEALTH-PATH — GET /health returns { status: 'ok' } (VERIFY:MON-HEALTH-PATH)
// TRACED:MON-READY-ENDPOINT — GET /health/ready with DB check branching (VERIFY:MON-READY-ENDPOINT)
// TRACED:MON-METRICS — GET /health/metrics returns memory and uptime (VERIFY:MON-METRICS)
// TRACED:MON-SHUTDOWN — enableShutdownHooks() in main.ts (VERIFY:MON-SHUTDOWN)
// TRACED:API-HEALTH-ENDPOINTS — /health, /health/ready, /health/metrics (VERIFY:API-HEALTH-ENDPOINTS)
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';

/**
 * Health and monitoring endpoints.
 * TRACED:AE-MON-001 — Health/ready/metrics endpoints at /health
 * @fully-public — health/monitoring endpoints are unauthenticated by design (no tenant scope needed)
 */
// fully-public
@Controller('health')
export class MonitoringController {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check — always returns OK if the server is running.
   * TRACED:AE-MON-002 — Health endpoint
   */
  @Public()
  @Get()
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check — verifies database connectivity.
   * TRACED:AE-MON-003 — Readiness endpoint with DB check branching
   */
  @Public()
  @Get('ready')
  async ready(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
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

  /**
   * Metrics endpoint with uptime and memory usage.
   * TRACED:AE-MON-004 — Metrics endpoint
   */
  @Public()
  @Get('metrics')
  metrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    timestamp: string;
  } {
    return {
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Alias controller for /metrics route (for SE-R compatibility).
 * TRACED:AE-MON-005 — Metrics alias at /metrics
 */
@Controller('metrics')
export class MetricsAliasController {
  private readonly startTime = Date.now();

  @Public()
  @Get()
  metrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    timestamp: string;
  } {
    return {
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

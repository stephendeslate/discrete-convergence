import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED: FD-MON-001
@Controller('health')
export class MonitoringController {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  // TRACED: FD-MON-006
  @Public()
  @Get('ready')
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'connected', status: 'ok' };
    } catch {
      return { database: 'disconnected', status: 'error' };
    }
  }
}

// TRACED: FD-MON-005
@Controller('metrics')
export class MetricsController {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  @Public()
  @Get()
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const avgResponseTime =
      this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgResponseTime: Math.round(avgResponseTime),
      uptime,
    };
  }
}

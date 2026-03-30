import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-006
// TRACED: EM-EDGE-010 — Database disconnection returns health/ready with database: disconnected
@Controller('health')
export class MonitoringController {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Public()
  @Get('ready')
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'connected', timestamp: new Date().toISOString() };
    } catch {
      return { database: 'disconnected', timestamp: new Date().toISOString() };
    }
  }
}

// TRACED: EM-MON-007
@Controller('metrics')
export class MetricsController {
  @Public()
  @Get()
  getMetrics() {
    return {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    };
  }
}

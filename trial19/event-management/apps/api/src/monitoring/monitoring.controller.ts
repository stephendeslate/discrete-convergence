import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-009
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

  @Public()
  @Get('ready')
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'connected' };
    } catch {
      return { database: 'disconnected' };
    }
  }
}

@Controller('metrics')
export class MetricsController {
  private readonly startTime = Date.now();

  @Public()
  @Get()
  getMetrics() {
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@repo/shared';

// TRACED: AE-MON-001
@Controller('health')
export class HealthController {
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

// TRACED: AE-MON-002
@Controller('metrics')
export class MetricsController {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  @Public()
  @Get()
  getMetrics() {
    return {
      requests: this.requestCount,
      errors: this.errorCount,
      averageResponseTime:
        this.requestCount > 0
          ? this.totalResponseTime / this.requestCount
          : 0,
      uptime: process.uptime(),
    };
  }

  incrementRequest(duration: number): void {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  incrementError(): void {
    this.errorCount++;
  }
}

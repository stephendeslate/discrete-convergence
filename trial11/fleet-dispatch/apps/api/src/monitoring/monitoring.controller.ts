import { Controller, Get, Post, Body } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED: FD-MON-008
// TRACED: FD-MON-010
@Controller('health')
export class MonitoringController {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED: FD-MON-009
  @Public()
  @SkipThrottle()
  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  addResponseTime(ms: number): void {
    this.totalResponseTime += ms;
  }

  getMetrics() {
    const avgResponseTime =
      this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: (Date.now() - this.startTime) / 1000,
    };
  }
}

// TRACED: FD-MON-011
@Controller('metrics')
export class MetricsController {
  constructor(private monitoringController: MonitoringController) {}

  @Public()
  @SkipThrottle()
  @Get()
  metrics() {
    return this.monitoringController.getMetrics();
  }
}

@Controller('errors')
export class ErrorReportController {
  @Public()
  @Post()
  report(@Body() body: { message: string; stack?: string }) {
    void body;
    return { received: true };
  }
}

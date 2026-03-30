// TRACED:EM-MON-001 TRACED:EM-MON-002 TRACED:EM-MON-003
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@repo/shared';
import { Public } from '../common/public.decorator';

@Public()
@Controller('health')
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth(): { status: string; version: string; timestamp: string } {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReady(): Promise<{ status: string; database: string; timestamp: string }> {
    const isHealthy = await this.prisma.healthCheck();
    if (isHealthy) {
      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    }
    throw new HttpException(
      {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/** Metrics endpoint — requires auth (no @Public decorator) */
@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics(): { uptime: number; memoryUsage: NodeJS.MemoryUsage; timestamp: string } {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

// TRACED:MONITORING — Health check endpoints at /health and /health/ready
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { APP_VERSION } from '@repo/shared';

@Controller('health')
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'degraded',
        database: 'disconnected',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('/metrics')
  metrics() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: APP_VERSION,
    };
  }
}

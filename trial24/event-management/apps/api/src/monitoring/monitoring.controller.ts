// TRACED:MONITORING-CONTROLLER
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { APP_VERSION } from '@em/shared';
import { Public } from '../common/auth-utils';

@Controller('health')
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    };
  }

  @Public()
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}

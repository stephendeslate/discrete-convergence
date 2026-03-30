import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';
import { Public } from '../common/public.decorator';

// TRACED: AE-INFRA-001
// TRACED: AE-EDGE-012 — Readiness returns degraded status on DB disconnect
@Controller('health')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  getHealth() {
    return this.monitoringService.getHealth();
  }

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

  @Public()
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }
}

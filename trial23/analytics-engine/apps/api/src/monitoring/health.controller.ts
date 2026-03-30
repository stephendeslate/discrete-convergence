// TRACED: AE-MON-003 — health returns status, timestamp, uptime, version
import { Controller, Get } from '@nestjs/common';
import { APP_VERSION } from '@repo/shared';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../infra/prisma.service';

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
      return { database: 'connected' };
    } catch {
      return { database: 'disconnected' };
    }
  }
}

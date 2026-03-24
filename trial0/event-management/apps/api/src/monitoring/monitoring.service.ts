// TRACED:EM-MON-007 — Health and readiness checks
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED:EM-MON-008 — Health endpoint with version from shared
  getHealth() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  // TRACED:EM-MON-009 — Readiness check with $queryRaw DB connectivity
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      return { status: 'not_ready' };
    }
  }
}

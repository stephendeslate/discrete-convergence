// TRACED:AE-MON-007 — Health and readiness checks
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  // TRACED:AE-MON-008 — Health endpoint with version from shared
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  // TRACED:AE-MON-009 — Readiness check with $queryRaw DB connectivity
  async getReady() {
    const result = await this.prisma.$queryRaw(Prisma.sql`SELECT 1 as connected`);
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}

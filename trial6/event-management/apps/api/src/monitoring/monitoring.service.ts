// TRACED:EM-MON-009 — MonitoringService with health, readiness, uptime, and version
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: string;
  database: string;
  timestamp: string;
}

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: APP_VERSION,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unavailable';
    }
    return {
      status: dbStatus === 'ok' ? 'ready' : 'not_ready',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

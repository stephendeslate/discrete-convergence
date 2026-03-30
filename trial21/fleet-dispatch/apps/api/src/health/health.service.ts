import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

/**
 * Health check logic for liveness and readiness probes.
 * TRACED: FD-INFRA-002
 * TRACED: FD-EDGE-010 — database connectivity loss detected via health/ready
 */
@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }
}

// TRACED:EM-DATA-001 TRACED:EM-DATA-003 TRACED:EM-DATA-006 TRACED:EM-INFRA-001
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Set tenant context for RLS policy enforcement */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  }

  /** Health check with automatic reconnection on failure */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      this.logger.warn('Database health check failed, attempting reconnect');
      try {
        await this.$disconnect();
        await this.$connect();
        await this.$queryRaw`SELECT 1`;
        return true;
      } catch {
        this.logger.error('Database reconnection failed');
        return false;
      }
    }
  }
}

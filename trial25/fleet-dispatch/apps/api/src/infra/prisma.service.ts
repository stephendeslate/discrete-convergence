// TRACED:FD-INFRA-001 — PrismaService with tenant context for RLS
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  // TRACED:FD-INFRA-002 — Set tenant context for row-level security
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase is only available in test environment');
    }
    // Delete in order respecting foreign key constraints
    await this.$executeRaw`DELETE FROM "audit_logs"`;
    await this.$executeRaw`DELETE FROM "trips"`;
    await this.$executeRaw`DELETE FROM "dispatches"`;
    await this.$executeRaw`DELETE FROM "maintenance"`;
    await this.$executeRaw`DELETE FROM "zones"`;
    await this.$executeRaw`DELETE FROM "routes"`;
    await this.$executeRaw`DELETE FROM "drivers"`;
    await this.$executeRaw`DELETE FROM "vehicles"`;
    await this.$executeRaw`DELETE FROM "users"`;
  }
}

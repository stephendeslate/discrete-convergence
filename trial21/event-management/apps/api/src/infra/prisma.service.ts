import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Set tenant context for RLS — TRACED:EM-SEC-005 TRACED:EM-SEC-004 */
  async setTenantContext(tenantId: string): Promise<void> {
    // Uses $executeRaw for RLS tenant isolation (at least one $executeRaw required)
    await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  }
}

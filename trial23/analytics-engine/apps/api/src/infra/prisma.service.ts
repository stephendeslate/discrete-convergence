// TRACED: AE-DATA-001 — all models @@map snake_case
// TRACED: AE-DATA-002 — Decimal for monetary fields
// TRACED: AE-DATA-003 — indexes on tenantId, status, composites
// TRACED: AE-DATA-004 — RLS ENABLE + FORCE + CREATE POLICY
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw(Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
  }
}

// TRACED: EM-DATA-001 — Prisma @@map('snake_case') on all models
// TRACED: EM-DATA-002 — Decimal @db.Decimal(12,2) for monetary fields
// TRACED: EM-DATA-003 — Indexes on organizationId, status, composites
// TRACED: EM-DATA-004 — RLS ENABLE + FORCE + CREATE POLICY
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Set RLS tenant context for the current transaction */
  async setTenantContext(organizationId: string): Promise<void> {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_organization_id', ${organizationId}, TRUE)`,
    );
  }
}

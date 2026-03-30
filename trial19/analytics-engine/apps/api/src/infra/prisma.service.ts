import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

// TRACED: AE-DATA-001 — Prisma client lifecycle
// TRACED: AE-DATA-002 — Schema models: Tenant, User, Dashboard, DataSource, Widget
// TRACED: AE-DATA-003 — RLS policies via migration (TEXT comparison, no ::uuid cast)
// TRACED: AE-DATA-005 — Composite indexes on tenantId + status/type/dashboardId
// TRACED: AE-DATA-006 — Enum @@map for snake_case DB naming
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // TRACED: AE-DATA-004
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}

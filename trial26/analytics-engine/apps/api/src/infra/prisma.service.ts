import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED: AE-DATA-001 — Prisma client with tenant context
// TRACED: AE-DATA-002 — Multi-tenant RLS via set_config
// TRACED: AE-DATA-003 — Connection lifecycle management
// TRACED: AE-DATA-004 — Module init/destroy hooks
// TRACED: AE-DATA-005 — Raw SQL for tenant isolation
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  }
}

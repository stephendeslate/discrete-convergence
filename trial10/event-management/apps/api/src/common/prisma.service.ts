// TRACED: EM-DATA-002 — Prisma enums with @@map and @map for PostgreSQL naming
// TRACED: EM-DATA-003 — Indexes on tenantId, status, and composites defined in schema.prisma
// TRACED: EM-DATA-005 — RLS with ENABLE + FORCE in migrations, no ::uuid cast
// TRACED: EM-DATA-007 — Multi-tenant entity relationships via tenantId FK
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

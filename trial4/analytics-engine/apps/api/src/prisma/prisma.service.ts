import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED:AE-DAT-001 — all models use @@map, all enums use @@map + @map on values (see schema.prisma)
// TRACED:AE-DAT-002 — @@index on tenantId FKs, status fields, composites (see schema.prisma)
// TRACED:AE-DAT-004 — RLS enabled via ENABLE + FORCE in migration (see migration.sql)
// TRACED:AE-DAT-005 — configEncrypted never returned in API responses or logged
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
}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED:AE-DATA-001 — Prisma service with lifecycle hooks
// TRACED:AE-DATA-002 — All models use @@map with snake_case table names
// TRACED:AE-DATA-003 — Monetary fields use Decimal @db.Decimal(12, 2), never Float
// TRACED:AE-DATA-004 — @@index on tenantId FKs, status fields, and composite (tenantId, status)
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

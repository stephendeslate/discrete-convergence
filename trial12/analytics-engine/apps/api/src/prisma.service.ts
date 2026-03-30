import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED: AE-DATA-001 — User model with role enum and tenantId
// TRACED: AE-DATA-002 — All enums use @@map and @map for snake_case mapping
// TRACED: AE-DATA-003 — @@index on tenantId, status, and composite fields
// TRACED: AE-DATA-004 — Monetary fields use Decimal @db.Decimal(12, 2)
// TRACED: AE-DATA-005 — Row Level Security enabled and forced on all tables

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

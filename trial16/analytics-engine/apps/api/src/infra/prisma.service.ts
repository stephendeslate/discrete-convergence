import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED: AE-DATA-001 — PrismaService extends PrismaClient with onModuleInit and onModuleDestroy lifecycle hooks
// TRACED: AE-DATA-002 — All models use @@map for snake_case table names, all enums use @@map with @map on values
// TRACED: AE-DATA-006 — Migration includes RLS ENABLE, FORCE, and CREATE POLICY for all tables with tenant_id

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

// TRACED:EM-DATA-001 — Prisma service with executeRaw for RLS context
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

  // TRACED:EM-SEC-001 — RLS context via $executeRaw with Prisma.sql template (never $executeRawUnsafe)
  async setRlsContext(organizationId: string): Promise<void> {
    await this.$executeRaw(Prisma.sql`SELECT set_config('app.current_organization_id', ${organizationId}, true)`);
  }
}

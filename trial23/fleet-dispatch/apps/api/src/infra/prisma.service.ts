// TRACED: FD-DATA-001 — Prisma Client with connection pooling
// TRACED: FD-DATA-002 — Row-level security via SET app.current_company_id
// TRACED: FD-DATA-003 — Transaction support via $transaction
// TRACED: FD-DATA-004 — Connection health check via $queryRaw
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL } },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async setTenantContext(companyId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.current_company_id', ${companyId}, true)`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

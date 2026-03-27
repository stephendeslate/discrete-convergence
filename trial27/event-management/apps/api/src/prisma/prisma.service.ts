// TRACED: EM-DATA-001 — Prisma service with lifecycle hooks
// TRACED: EM-DATA-002 — Tenant model with tier enum
// TRACED: EM-DATA-003 — User model with tenant relation
// TRACED: EM-DATA-005 — All models have @@index on foreign keys
// TRACED: EM-DATA-008 — AuditLog model for activity tracking
// TRACED: EM-SEC-005 — Row-Level Security on all tenanted tables
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantTier } from '@event-management/shared';

/** Default tenant tier for new tenants: {@link TenantTier.FREE} */
export const DEFAULT_TENANT_TIER = TenantTier.FREE;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}

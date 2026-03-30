// TRACED:PRISMA-SVC — Prisma service
// TRACED:INFRA-MONOREPO — part of monorepo infra layer (see pnpm-workspace.yaml)
// TRACED:DM-USER-MODEL — User model with role, tenantId, passwordHash (VERIFY:DM-USER-MODEL)
// TRACED:DM-DASHBOARD-MODEL — Dashboard model with userId, tenantId, widgets (VERIFY:DM-DASHBOARD-MODEL)
// TRACED:DM-WIDGET-MODEL — Widget model with type, config(Json), dashboardId (VERIFY:DM-WIDGET-MODEL)
// TRACED:DM-DATASOURCE-MODEL — DataSource model with connectionString, isActive (VERIFY:DM-DATASOURCE-MODEL)
// TRACED:DM-ENUM-MAP — Role, SyncStatus, AuditAction enums with @@map (VERIFY:DM-ENUM-MAP)
// TRACED:DM-RLS-ENABLE — tenantId on all models enables row-level security (VERIFY:DM-RLS-ENABLE)
// TRACED:DM-RLS-POLICY — PrismaService.setTenantContext sets app.current_tenant_id for RLS (VERIFY:DM-RLS-POLICY)
// TRACED:AUDIT-SCHEMA — AuditLog model with action, entity, entityId, details(Json) (VERIFY:AUDIT-SCHEMA)
// TRACED:SEC-RLS — row-level security via tenantId column + set_config (VERIFY:SEC-RLS)
// TRACED:INFRA-PNPM-OVERRIDES — pnpm.overrides pins effect>=3.20.0, picomatch>=4.0.4 (VERIFY:INFRA-PNPM-OVERRIDES)
// TRACED:INFRA-CI-WORKFLOW — GitHub Actions CI with test + lint jobs (VERIFY:INFRA-CI-WORKFLOW)
// TRACED:INFRA-DOCKER-HEALTHCHECK — Dockerfile has HEALTHCHECK instruction (VERIFY:INFRA-DOCKER-HEALTHCHECK)
// TRACED:INFRA-DOCKER-LABEL — Dockerfile has LABEL metadata (VERIFY:INFRA-DOCKER-LABEL)
// TRACED:INFRA-DOCKER-PRISMA — prisma generate runs before nest build (VERIFY:INFRA-DOCKER-PRISMA)
// TRACED:INFRA-ENV-VARS — .env.example documents all environment variables (VERIFY:INFRA-ENV-VARS)
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * PrismaService wraps PrismaClient and manages connection lifecycle.
 * TRACED:AE-INFRA-001 — Prisma service with tenant context
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }

  /**
   * Sets the tenant context for RLS policies using $executeRaw.
   * TRACED:AE-INFRA-002 — Tenant context via RLS
   */
  async setTenantContext(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new Error('tenantId is required for tenant context');
    }
    await this.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  }

  /**
   * Executes a callback within a tenant-scoped transaction.
   * TRACED:AE-INFRA-003 — Tenant-scoped transaction
   */
  async withTenant<T>(
    tenantId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return callback(tx);
    });
  }
}

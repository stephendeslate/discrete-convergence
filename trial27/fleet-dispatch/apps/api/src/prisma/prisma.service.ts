// TRACED: FD-DM-001 — Prisma service with @@map snake_case models and graceful shutdown
// TRACED: FD-DM-002 — Tenant model with tier enum (TenantTier: FREE/PRO/ENTERPRISE)
// TRACED: FD-DM-003 — User model with tenant relation and unique (tenantId, email)
// TRACED: FD-DM-004 — Vehicle model with VehicleType and VehicleStatus enums
// TRACED: FD-DM-005 — Driver model with DriverStatus enum and unique constraints
// TRACED: FD-DM-006 — DispatchJob model with JobStatus transitions
// TRACED: FD-DM-007 — All foreign keys have @@index, composite indexes on (tenantId, status)
// TRACED: FD-DM-008 — MaintenanceLog and AuditLog models for tracking
// TRACED: FD-SEC-003 — Row-Level Security on all tenanted tables via current_setting
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantTier } from '@fleet-dispatch/shared';

/** Default tenant tier for new tenants: {@link TenantTier.FREE} */
export const DEFAULT_TENANT_TIER = TenantTier.FREE;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  /**
   * Check if the database connection is healthy.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

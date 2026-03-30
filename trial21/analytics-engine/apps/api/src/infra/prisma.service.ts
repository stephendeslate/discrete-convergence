import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';

/**
 * Prisma service providing database access.
 * VERIFY: AE-INFRA-002 — Prisma service lifecycle management
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy { // TRACED: AE-INFRA-002
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
   * Sets the tenant context for RLS.
   * Uses $executeRaw with Prisma.sql template for safe parameterization.
   * VERIFY: AE-SEC-011 — RLS tenant context setting uses parameterized query
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw(Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`); // TRACED: AE-SEC-011 // TRACED: AE-SEC-010
  }
}

// TRACED:API-PRISMA-MODULE
import { Global, Module, Injectable, OnModuleInit, OnModuleDestroy, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async setCompanyId(companyId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.company_id', ${companyId}, true)`;
  }
}

interface RequestWithUser {
  user?: { companyId?: string };
}

@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(REQUEST) private readonly request: RequestWithUser,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    // Uses the shared connection from PrismaService
  }

  async onModuleDestroy(): Promise<void> {
    // Cleanup handled by PrismaService
  }

  async withCompanyContext<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    const companyId = this.request.user?.companyId;
    if (companyId) {
      await this.prisma.setCompanyId(companyId);
    }
    return fn(this.prisma);
  }
}

@Global()
@Module({
  providers: [PrismaService, TenantPrismaService],
  exports: [PrismaService, TenantPrismaService],
})
export class PrismaModule {}

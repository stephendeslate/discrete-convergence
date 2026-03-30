import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TRACED:EM-DATA-001
// TRACED:EM-DATA-003 (RLS enabled in migration for all tables)
// TRACED:EM-INFRA-003 (Dockerfile: multi-stage, node:20-alpine, HEALTHCHECK, USER node)
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

// TRACED:PRISMA-MOD — Prisma module
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * TRACED:AE-INFRA-004 — Global Prisma module
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

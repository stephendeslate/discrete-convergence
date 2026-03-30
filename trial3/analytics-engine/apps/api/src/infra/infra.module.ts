// TRACED:AE-INFRA-001 — multi-stage Dockerfile with node:20-alpine, healthcheck, and USER node
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  providers: [PrismaService, PinoLoggerService, RequestContextService, MetricsService],
  exports: [PrismaService, PinoLoggerService, RequestContextService, MetricsService],
})
export class InfraModule {}

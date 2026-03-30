import { Module } from '@nestjs/common';
import { HealthController, MetricsController } from './monitoring.controller';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [
    PinoLoggerService,
    RequestContextService,
    MetricsService,
    PrismaService,
  ],
  exports: [PinoLoggerService, RequestContextService, MetricsService],
})
export class MonitoringModule {}

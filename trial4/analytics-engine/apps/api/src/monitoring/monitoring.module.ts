import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [MonitoringController],
  providers: [PinoLoggerService, RequestContextService, MetricsService],
  exports: [PinoLoggerService, RequestContextService, MetricsService],
})
export class MonitoringModule {}

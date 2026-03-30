import { Module } from '@nestjs/common';
import { MonitoringController, MetricsController } from './monitoring.controller';
import { MetricsService } from './metrics.service';
import { PinoLoggerService } from './pino-logger.service';

@Module({
  controllers: [MonitoringController, MetricsController],
  providers: [MetricsService, PinoLoggerService],
  exports: [MetricsService, PinoLoggerService],
})
export class MonitoringModule {}

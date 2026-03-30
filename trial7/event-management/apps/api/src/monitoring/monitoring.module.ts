import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MetricsService } from './metrics.service';
import { RequestContextService } from './request-context.service';

@Module({
  controllers: [MonitoringController],
  providers: [MetricsService, RequestContextService],
  exports: [MetricsService, RequestContextService],
})
export class MonitoringModule {}

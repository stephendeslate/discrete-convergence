import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  providers: [MonitoringService, MetricsService],
  controllers: [MonitoringController],
  exports: [MetricsService],
})
export class MonitoringModule {}

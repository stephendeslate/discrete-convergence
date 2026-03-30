// TRACED:API-MONITORING-MODULE
import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MonitoringController, MetricsController],
})
export class MonitoringModule {}

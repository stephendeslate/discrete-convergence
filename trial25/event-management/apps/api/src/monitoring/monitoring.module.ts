// TRACED:EM-MON-001
import { Module } from '@nestjs/common';
import { MonitoringController, MetricsController } from './monitoring.controller';

@Module({
  controllers: [MonitoringController, MetricsController],
})
export class MonitoringModule {}

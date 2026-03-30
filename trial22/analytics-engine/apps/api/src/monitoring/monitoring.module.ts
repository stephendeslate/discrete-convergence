import { Module } from '@nestjs/common';
import { HealthController, MetricsController } from './monitoring.controller';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [MetricsController],
  exports: [MetricsController],
})
export class MonitoringModule {}

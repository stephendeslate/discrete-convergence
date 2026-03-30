import { Module } from '@nestjs/common';
import { HealthController, MetricsController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}

import { Module } from '@nestjs/common';
import { HealthController, MetricsController } from './monitoring.controller';

@Module({
  controllers: [HealthController, MetricsController],
})
export class MonitoringModule {}

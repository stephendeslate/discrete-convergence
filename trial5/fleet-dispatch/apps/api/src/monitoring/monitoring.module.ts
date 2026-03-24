import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MetricsService } from '../common/services/metrics.service';

@Module({
  controllers: [MonitoringController],
  providers: [MetricsService],
})
export class MonitoringModule {}

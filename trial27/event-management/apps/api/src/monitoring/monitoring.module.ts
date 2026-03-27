// TRACED: EM-MON-001 — Monitoring module
import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';

@Module({
  controllers: [MonitoringController],
})
export class MonitoringModule {}

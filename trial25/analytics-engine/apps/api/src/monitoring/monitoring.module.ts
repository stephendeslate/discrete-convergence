// TRACED:MON-MOD — Monitoring module
import { Module } from '@nestjs/common';
import { MonitoringController, MetricsAliasController } from './monitoring.controller';

/**
 * TRACED:AE-MON-MOD-001 — Monitoring module
 */
@Module({
  controllers: [MonitoringController, MetricsAliasController],
})
export class MonitoringModule {}

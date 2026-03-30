// TRACED:DS-MOD — Data source module
import { Module } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

/**
 * TRACED:AE-DS-MOD-001 — Data source module
 */
@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}

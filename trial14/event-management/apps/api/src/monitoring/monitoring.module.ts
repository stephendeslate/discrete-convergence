import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { RequestContextService } from './request-context.service';

@Module({
  controllers: [MonitoringController],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class MonitoringModule {}

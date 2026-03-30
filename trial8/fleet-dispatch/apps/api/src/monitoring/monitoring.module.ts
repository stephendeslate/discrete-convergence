import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { LoggerService } from '../infra/logger.service';

@Module({
  controllers: [MonitoringController],
  providers: [LoggerService],
})
export class MonitoringModule {}

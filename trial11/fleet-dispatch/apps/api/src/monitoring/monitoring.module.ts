import { Module } from '@nestjs/common';
import { MonitoringController, MetricsController, ErrorReportController } from './monitoring.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MonitoringController, MetricsController, ErrorReportController],
  providers: [MonitoringController, PrismaService],
  exports: [MonitoringController],
})
export class MonitoringModule {}

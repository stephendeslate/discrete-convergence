import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../common/services/prisma.service';
import { MetricsService } from '../common/services/metrics.service';

@Module({
  controllers: [MonitoringController],
  providers: [PrismaService, MetricsService],
})
export class MonitoringModule {}

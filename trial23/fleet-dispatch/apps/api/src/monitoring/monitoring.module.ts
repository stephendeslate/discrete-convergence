import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';
import { PrismaService } from '../infra/prisma.service';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [MonitoringService, PrismaService],
})
export class MonitoringModule {}

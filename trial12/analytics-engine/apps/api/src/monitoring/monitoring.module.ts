import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../prisma.service';
import { RequestContextService } from '../common/request-context.service';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, PrismaService, RequestContextService],
  exports: [MonitoringService, RequestContextService],
})
export class MonitoringModule {}

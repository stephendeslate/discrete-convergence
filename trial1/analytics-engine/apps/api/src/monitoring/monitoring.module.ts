import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MonitoringController],
  providers: [PrismaService],
})
export class MonitoringModule {}

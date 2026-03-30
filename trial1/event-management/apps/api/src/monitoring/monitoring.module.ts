import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [PrismaService],
  controllers: [MonitoringController],
})
export class MonitoringModule {}

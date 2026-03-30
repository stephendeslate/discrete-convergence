import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, PrismaService, LoggerService],
})
export class MaintenanceModule {}

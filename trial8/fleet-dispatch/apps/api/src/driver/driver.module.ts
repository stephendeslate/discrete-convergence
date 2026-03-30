import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';

@Module({
  controllers: [DriverController],
  providers: [DriverService, PrismaService, LoggerService],
})
export class DriverModule {}

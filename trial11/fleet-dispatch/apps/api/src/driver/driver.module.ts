import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [DriverController],
  providers: [DriverService, PrismaService],
  exports: [DriverService],
})
export class DriverModule {}

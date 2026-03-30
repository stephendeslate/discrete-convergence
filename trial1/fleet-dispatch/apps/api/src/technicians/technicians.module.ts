import { Module } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [TechniciansController],
  providers: [TechniciansService, PrismaService],
  exports: [TechniciansService],
})
export class TechniciansModule {}

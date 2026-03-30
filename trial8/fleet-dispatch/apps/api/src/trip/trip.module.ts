import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';

@Module({
  controllers: [TripController],
  providers: [TripService, PrismaService, LoggerService],
})
export class TripModule {}

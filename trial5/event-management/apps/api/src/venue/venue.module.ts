import { Module } from '@nestjs/common';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [VenueController],
  providers: [VenueService, PrismaService],
  exports: [VenueService],
})
export class VenueModule {}

import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [VenueService, PrismaService],
  controllers: [VenueController],
  exports: [VenueService],
})
export class VenueModule {}

import { Module } from '@nestjs/common';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AttendeeController],
  providers: [AttendeeService, PrismaService],
  exports: [AttendeeService],
})
export class AttendeeModule {}

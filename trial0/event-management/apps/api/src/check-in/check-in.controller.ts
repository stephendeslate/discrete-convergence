import { Controller, Post, Get, Param } from '@nestjs/common';
import { CheckInService } from './check-in.service';

@Controller()
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('check-in/:registrationId')
  async checkIn(@Param('registrationId') registrationId: string) {
    return this.checkInService.checkIn(registrationId);
  }

  @Get('events/:eventId/check-in-stats')
  async getStats(@Param('eventId') eventId: string) {
    return this.checkInService.getStats(eventId);
  }
}

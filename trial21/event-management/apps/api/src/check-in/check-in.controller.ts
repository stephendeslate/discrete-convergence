import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { Roles } from '../common/roles.decorator';

/** TRACED:EM-CHK-003 — Check-in endpoints */
@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post(':registrationId')
  async checkIn(@Param('registrationId') registrationId: string) {
    return this.checkInService.checkIn(registrationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Get('stats')
  async stats(@Query('eventId') eventId: string) {
    return this.checkInService.getStats(eventId);
  }
}

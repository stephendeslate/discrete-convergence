import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { Roles } from '../common/roles.decorator';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Get()
  async findAll(@Query('eventId') eventId: string) {
    return this.waitlistService.findAll(eventId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Post(':eventId/promote/:entryId')
  async promote(
    @Param('eventId') eventId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.waitlistService.promote(eventId, entryId);
  }
}

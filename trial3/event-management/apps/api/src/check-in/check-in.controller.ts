// TRACED:EM-CHK-002
import { Controller, Post, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { CheckInService } from './check-in.service';
import { AuthenticatedUser } from '../common/auth-utils';

@Controller()
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post('check-in/:registrationId')
  async checkIn(
    @Param('registrationId') registrationId: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.checkInService.checkIn(
      registrationId,
      user.userId,
      user.organizationId,
    );
  }

  @Get('events/:eventId/check-in-stats')
  async getCheckInStats(
    @Param('eventId') eventId: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.checkInService.getCheckInStats(eventId, user.organizationId);
  }
}

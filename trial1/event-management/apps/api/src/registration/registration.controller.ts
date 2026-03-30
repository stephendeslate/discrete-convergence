// TRACED:EM-API-002 — Registration controller with capacity check routing
import { Controller, Post, Get, Patch, Param, Body, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegistrationService } from './registration.service';
import { getOrganizationId, getAuthenticatedUser } from '../common/auth-utils';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  register(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body('ticketTypeId') ticketTypeId: string,
  ) {
    const user = getAuthenticatedUser(req);
    return this.registrationService.register(user.organizationId, eventId, user.id, ticketTypeId);
  }

  @Get('events/:eventId/registrations')
  async findByEvent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('eventId') eventId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=60');
    return this.registrationService.findByEvent(getOrganizationId(req), eventId, Number(page), Number(pageSize));
  }

  @Patch('registrations/:id/cancel')
  cancel(@Req() req: Request, @Param('id') id: string) {
    return this.registrationService.cancel(getOrganizationId(req), id);
  }
}

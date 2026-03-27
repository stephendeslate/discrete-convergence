// TRACED: EM-API-006 — Registration controller
import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { AuthenticatedUser } from '../common/auth-utils';

@Controller('events/:eventId/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.registrationService.create(user.tenantId, eventId, dto);
  }

  @Get()
  async findByEvent(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.registrationService.findByEvent(user.tenantId, eventId, page, pageSize);
  }
}

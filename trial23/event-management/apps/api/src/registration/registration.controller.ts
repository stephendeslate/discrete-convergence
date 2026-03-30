import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { extractUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/pagination.utils';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:id/register')
  async register(
    @Req() req: Request,
    @Param('id') eventId: string,
    @Body() dto: CreateRegistrationDto,
  ) {
    const user = extractUser(req);
    return this.registrationService.register(user.organizationId, eventId, dto);
  }

  @Get('events/:id/registrations')
  async findAllByEvent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') eventId: string,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.registrationService.findAllByEvent(
      user.organizationId,
      eventId,
      query.page,
      query.limit,
    );
  }

  @Patch('registrations/:id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.registrationService.cancel(user.organizationId, id);
  }
}

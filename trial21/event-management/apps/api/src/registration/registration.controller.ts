import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

/** TRACED:EM-REG-005 — Registration endpoints */
@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.registrationService.register(eventId, req.user.id, dto);
  }

  @Get('events/:eventId/registrations')
  async findAll(
    @Param('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.registrationService.findAll(eventId, query.page, query.limit);
  }

  @Get('my-registrations')
  async myRegistrations(
    @Query() query: PaginatedQueryDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.registrationService.findUserRegistrations(req.user.id, query.page, query.limit);
  }

  @Post('registrations/:registrationId/cancel')
  async cancel(
    @Param('registrationId') registrationId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.registrationService.cancel(registrationId, req.user.id);
  }
}

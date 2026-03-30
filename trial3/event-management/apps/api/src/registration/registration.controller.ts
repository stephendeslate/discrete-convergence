// TRACED:EM-REG-002
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';
import { PaginatedResult } from '../common/pagination.utils';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.registrationService.register(
      eventId,
      dto,
      user.userId,
      user.organizationId,
    );
  }

  @Get('events/:eventId/registrations')
  @Header('Cache-Control', 'private, max-age=10')
  async findAllForEvent(
    @Param('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const user = req.user as AuthenticatedUser;
    return this.registrationService.findAllForEvent(
      eventId,
      user.organizationId,
      query,
    );
  }

  @Patch('registrations/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.registrationService.cancel(id, user.organizationId);
  }
}

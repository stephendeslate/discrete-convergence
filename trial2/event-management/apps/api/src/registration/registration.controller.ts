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
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:EM-API-004 — Registration endpoints for register, list, cancel

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  register(
    @Body() dto: CreateRegistrationDto,
    @Param('eventId') eventId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    dto.eventId = eventId;
    return this.registrationService.register(
      dto,
      req.user.sub,
      req.user.organizationId,
    );
  }

  @Get('events/:eventId/registrations')
  @Header('Cache-Control', 'private, max-age=10')
  findByEvent(
    @Param('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.registrationService.findByEvent(
      eventId,
      req.user.organizationId,
      query,
    );
  }

  @Patch('registrations/:id/cancel')
  cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.registrationService.cancel(id, req.user.organizationId);
  }
}

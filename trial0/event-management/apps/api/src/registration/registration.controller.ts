import { Controller, Post, Get, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.registrationService.register(eventId, dto, req.user.sub);
  }

  @Get('events/:eventId/registrations')
  async findByEvent(
    @Param('eventId') eventId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.registrationService.findByEvent(
      eventId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Patch('registrations/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.registrationService.cancel(id, req.user.sub);
  }
}

// TRACED:EM-API-004 — Registration endpoints (no @UseGuards)
import { Controller, Get, Post, Patch, Param, Body, Query, Req, Header } from '@nestjs/common';
import { Request } from 'express';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string; organizationId: string };
    return this.registrationService.register(eventId, dto, user.userId, user.organizationId);
  }

  @Get('events/:eventId/registrations')
  @Header('Cache-Control', 'public, max-age=10, stale-while-revalidate=30')
  async findByEvent(
    @Param('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as { organizationId: string };
    return this.registrationService.findByEvent(eventId, user.organizationId, query.page, query.pageSize);
  }

  @Patch('registrations/:id/cancel')
  async cancel(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.registrationService.cancel(id, user.organizationId);
  }

  @Post('check-in/:registrationId')
  async checkIn(@Param('registrationId') registrationId: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.registrationService.checkIn(registrationId, user.organizationId);
  }

  @Get('events/:eventId/check-in-stats')
  async checkInStats(@Param('eventId') eventId: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.registrationService.getCheckInStats(eventId, user.organizationId);
  }
}

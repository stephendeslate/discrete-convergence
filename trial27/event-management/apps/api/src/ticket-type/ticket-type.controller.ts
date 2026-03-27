// TRACED: EM-API-005 — TicketType controller
import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { TicketTypeService } from './ticket-type.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { AuthenticatedUser } from '../common/auth-utils';

@Controller('events/:eventId/ticket-types')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body() dto: CreateTicketTypeDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.ticketTypeService.create(user.tenantId, eventId, dto);
  }

  @Get()
  async findByEvent(@Req() req: Request, @Param('eventId') eventId: string) {
    const user = req.user as AuthenticatedUser;
    return this.ticketTypeService.findByEvent(user.tenantId, eventId);
  }
}

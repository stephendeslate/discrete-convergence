import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './ticket-type.dto';
import { Roles } from '../common/roles.decorator';

@Controller('events/:eventId/ticket-types')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateTicketTypeDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.ticketTypeService.create(eventId, dto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.ticketTypeService.findAll(eventId, req.user.organizationId);
  }

  @Get(':ticketTypeId')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.ticketTypeService.findOne(eventId, ticketTypeId, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Patch(':ticketTypeId')
  async update(
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() dto: UpdateTicketTypeDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.ticketTypeService.update(eventId, ticketTypeId, dto, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Delete(':ticketTypeId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.ticketTypeService.remove(eventId, ticketTypeId, req.user.organizationId);
  }
}

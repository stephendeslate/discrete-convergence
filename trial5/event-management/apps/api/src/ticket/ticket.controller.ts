// TRACED:EM-API-006 — TicketController with RBAC guards
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(
    @Body() dto: CreateTicketDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.ticketService.create(dto, req.user.tenantId);
  }

  @Get()
  async findAll(
    @Query('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.ticketService.findAll(eventId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}

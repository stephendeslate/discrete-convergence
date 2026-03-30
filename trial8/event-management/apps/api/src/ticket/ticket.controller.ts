import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

// TRACED: EM-API-005 — Ticket controller with role-based access
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateTicketDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.remove(id, user.tenantId);
  }
}

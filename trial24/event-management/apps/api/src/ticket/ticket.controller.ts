// TRACED:TICKET-CONTROLLER
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole } from '../common/auth-utils';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.ticketService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.ticketService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.ticketService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.ticketService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.ticketService.remove(id, user.organizationId);
  }
}

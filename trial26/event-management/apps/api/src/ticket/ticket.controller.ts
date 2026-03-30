// TRACED:EM-TKT-001 TRACED:EM-TKT-002 TRACED:EM-TKT-003 TRACED:EM-TKT-004
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './ticket.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.ticketService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTicketDto) {
    const user = getAuthUser(req);
    return this.ticketService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.ticketService.findOne(id, user.tenantId);
  }

  @Patch(':id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.ticketService.cancelTicket(id, user.tenantId, user.userId);
  }

  @Patch(':id/refund')
  async refund(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.ticketService.refundTicket(id, user.tenantId, user.userId);
  }
}

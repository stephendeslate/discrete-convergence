// TRACED:EM-EVT-001 TRACED:EM-EVT-002 TRACED:EM-EVT-003 TRACED:EM-EVT-004
import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';
import { Roles } from '../common/roles.decorator';

@Controller('events')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.eventService.findAll(user.tenantId, query);
  }

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const user = getAuthUser(req);
    return this.eventService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.eventService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    const user = getAuthUser(req);
    return this.eventService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.eventService.remove(id, user.tenantId, user.userId);
  }

  @Patch(':id/publish')
  async publish(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.eventService.publish(id, user.tenantId, user.userId);
  }

  @Patch(':id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.eventService.cancel(id, user.tenantId, user.userId);
  }
}

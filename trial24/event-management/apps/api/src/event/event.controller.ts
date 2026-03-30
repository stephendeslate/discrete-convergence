// TRACED:EVENT-CONTROLLER
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole, RolesGuard, Roles } from '../common/auth-utils';

@Controller('events')
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.eventService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.eventService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.eventService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.eventService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.eventService.remove(id, user.organizationId);
  }
}

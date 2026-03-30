// TRACED:ATTENDEE-CONTROLLER
import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole } from '../common/auth-utils';

@Controller('attendees')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  async create(@Body() dto: CreateAttendeeDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.attendeeService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.attendeeService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.attendeeService.findOne(id, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.attendeeService.remove(id, user.organizationId);
  }
}

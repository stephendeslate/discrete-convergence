// TRACED:EM-ATT-001 TRACED:EM-ATT-002 TRACED:EM-ATT-003
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './attendee.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('attendees')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.attendeeService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAttendeeDto) {
    const user = getAuthUser(req);
    return this.attendeeService.registerAttendee(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.attendeeService.findOne(id, user.tenantId);
  }

  @Patch(':id/check-in')
  async checkIn(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.attendeeService.checkIn(id, user.tenantId, user.userId);
  }
}

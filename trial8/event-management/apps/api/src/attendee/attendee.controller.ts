import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

// TRACED: EM-API-007 — Attendee controller with role-based access
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  async create(@Body() dto: CreateAttendeeDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.attendeeService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.attendeeService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.attendeeService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAttendeeDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.attendeeService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.attendeeService.remove(id, user.tenantId);
  }
}

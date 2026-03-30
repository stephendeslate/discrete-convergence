import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

// TRACED: EM-API-009 — Schedule controller with role-based access
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateScheduleDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.scheduleService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.scheduleService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.scheduleService.findOne(id, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.scheduleService.remove(id, user.tenantId);
  }
}

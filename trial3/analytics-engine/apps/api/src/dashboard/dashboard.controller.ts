// TRACED:AE-PERF-003 — Cache-Control on list endpoint
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { RequestUser } from '../common/auth-utils';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const user = req.user as RequestUser;
    return this.dashboardService.create(user.tenantId, dto.title, dto.description);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as RequestUser;
    return this.dashboardService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dashboardService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    const user = req.user as RequestUser;
    return this.dashboardService.update(id, user.tenantId, dto.title, dto.description);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dashboardService.remove(id, user.tenantId);
  }

  @Patch(':id/publish')
  publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dashboardService.publish(id, user.tenantId);
  }

  @Patch(':id/archive')
  archive(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dashboardService.archive(id, user.tenantId);
  }
}

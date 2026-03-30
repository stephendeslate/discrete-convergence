import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/auth-utils';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

/**
 * VERIFY: AE-DASH-005 — dashboard CRUD endpoints with tenant scoping
 */
@Controller('dashboards') // TRACED: AE-DASH-005
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.user.tenantId, req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: PaginatedQueryDto) {
    return this.dashboardService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardService.update(req.user.tenantId, id, dto);
  }

  @Roles('ADMIN', 'USER')
  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.remove(req.user.tenantId, id);
  }

  @Post(':id/publish')
  async publish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.publish(req.user.tenantId, id);
  }

  @Post(':id/archive')
  async archive(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.archive(req.user.tenantId, id);
  }
}

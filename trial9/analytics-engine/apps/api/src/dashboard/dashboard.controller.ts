import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { RequestWithUser, Roles } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-DASH-002
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Body() dto: CreateDashboardDto, @Req() req: RequestWithUser) {
    return this.dashboardService.create(dto, req.user.tenantId, req.user.sub);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // TRACED: AE-PERF-005
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dashboardService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }

  @Get('stats/summary')
  @Roles('ADMIN')
  getStats(@Req() req: RequestWithUser) {
    return this.dashboardService.getStats(req.user.tenantId);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '@analytics-engine/shared';

// TRACED: AE-API-001
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'no-store');
    return this.dashboardService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(id, req.user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, Header } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '@analytics-engine/shared';
import { PaginatedQueryDto } from '../common/paginated-query';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; role: string };
}

// TRACED:AE-DASH-003
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Body() dto: CreateDashboardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dashboardService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}

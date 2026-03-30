import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:AE-DASH-002 — Dashboard controller with Cache-Control on list endpoint
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Req() req: AuthenticatedRequest,
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
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }

  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.publish(id, req.user.tenantId);
  }

  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.archive(id, req.user.tenantId);
  }
}

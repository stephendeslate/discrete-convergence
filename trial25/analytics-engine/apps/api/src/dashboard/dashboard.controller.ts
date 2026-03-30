// TRACED:DASH-CTRL — Dashboard controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { AuthUser } from '../common/auth-utils';

/**
 * Dashboard CRUD controller.
 * TRACED:AE-DASH-CTRL-001 — Dashboard controller with auth guards
 */
@Controller('dashboards')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthUser;
    return this.dashboardService.findAll(user.tenantId, query.page, query.limit);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const user = req.user as AuthUser;
    return this.dashboardService.create(dto, user.userId, user.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dashboardService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const user = req.user as AuthUser;
    return this.dashboardService.update(
      id,
      dto,
      user.userId,
      user.tenantId,
      user.role,
    );
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dashboardService.remove(
      id,
      user.userId,
      user.tenantId,
      user.role,
    );
  }
}

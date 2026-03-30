// TRACED:DASHBOARD-CONTROLLER — REST endpoints for dashboards
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, RolesGuard, Roles } from '../common/auth-utils';
import { Request } from 'express';

@Controller('dashboards')
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Body() dto: CreateDashboardDto, @Req() req: Request) {
    const user = extractUser(req);
    return this.dashboardService.create(dto, user.sub, user.tenantId);
  }

  @Get()
  findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.dashboardService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.dashboardService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDashboardDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.dashboardService.update(id, dto, user.sub, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.dashboardService.remove(id, user.sub, user.tenantId);
  }
}

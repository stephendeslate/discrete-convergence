// TRACED:AE-API-001 — Dashboard CRUD controller with full endpoints
// TRACED:AE-API-006 — Cache-Control headers on list endpoints
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
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import { Roles } from '../common/roles.decorator';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const tenantId = getTenantId(req);
    return this.dashboardService.create(tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const tenantId = getTenantId(req);
    const params = parsePaginationParams(page, limit);
    return this.dashboardService.findAll(tenantId, params.page, params.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = getTenantId(req);
    return this.dashboardService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const tenantId = getTenantId(req);
    return this.dashboardService.update(tenantId, id, dto);
  }

  @Roles('ADMIN', 'ANALYST')
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantId = getTenantId(req);
    return this.dashboardService.remove(tenantId, id);
  }
}

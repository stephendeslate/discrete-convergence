// TRACED:AE-API-001 — Dashboard endpoints with JWT + RBAC guards and tenant isolation
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import type { CreateDashboardDto } from './dto/create-dashboard.dto';
import type { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @Roles('ADMIN', 'USER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(getTenantId(req), dto);
  }

  @Get()
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params = parsePaginationParams(page, limit);
    return this.dashboardService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dashboardService.findOne(getTenantId(req), id);
  }

  @Put(':id')
  @Roles('ADMIN', 'USER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.dashboardService.remove(getTenantId(req), id);
  }
}

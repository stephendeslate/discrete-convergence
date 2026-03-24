// TRACED:AE-DASH-004 — Dashboard controller with CRUD + publish/archive
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Headers,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Body() dto: CreateDashboardDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.create(dto, req.user.tenantId);
  }

  // TRACED:AE-PERF-004 — Cache-Control on list endpoint
  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    res?.setHeader('Cache-Control', 'private, max-age=30');
    return this.dashboardService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }

  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.publish(id, req.user.tenantId);
  }

  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.archive(id, req.user.tenantId);
  }
}

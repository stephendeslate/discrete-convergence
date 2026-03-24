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

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, no-cache');
    return this.dashboardService.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.remove(user.tenantId, id);
  }
}

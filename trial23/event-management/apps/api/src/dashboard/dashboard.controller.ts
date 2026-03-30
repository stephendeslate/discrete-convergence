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
import { Roles } from '../common/roles.decorator';
import { extractUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/pagination.utils';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.dashboardService.findAll(user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.dashboardService.findOne(user.organizationId, id);
  }

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const user = extractUser(req);
    return this.dashboardService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const user = extractUser(req);
    return this.dashboardService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.dashboardService.remove(user.organizationId, id);
  }
}

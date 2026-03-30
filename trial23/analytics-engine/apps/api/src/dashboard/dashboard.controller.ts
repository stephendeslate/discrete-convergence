import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return this.dashboardService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }

  @Patch(':id/publish')
  async publish(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.publish(id, req.user.tenantId);
  }

  @Patch(':id/archive')
  async archive(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dashboardService.archive(id, req.user.tenantId);
  }
}

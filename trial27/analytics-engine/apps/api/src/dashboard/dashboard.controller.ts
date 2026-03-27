import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateDashboardDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query() query: PaginatedQueryDto,
    @Headers('cache-control') _cacheControl?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.findOne(user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.update(user.tenantId, id, dto);
  }

  @Patch(':id/publish')
  async publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.publish(user.tenantId, id);
  }

  @Patch(':id/archive')
  async archive(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.archive(user.tenantId, id);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dashboardService.remove(user.tenantId, id);
  }
}

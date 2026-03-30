import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/auth-utils';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

/**
 * VERIFY: AE-DS-004 — data source endpoints with tier-based limits
 */
@Controller('data-sources') // TRACED: AE-DS-004
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: PaginatedQueryDto) {
    return this.dataSourceService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    return this.dataSourceService.update(req.user.tenantId, id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.remove(req.user.tenantId, id);
  }

  @Post(':id/sync')
  async triggerSync(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.triggerSync(req.user.tenantId, id);
  }

  @Get(':id/sync-history')
  async syncHistory(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dataSourceService.getSyncHistory(req.user.tenantId, id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, Header } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '@analytics-engine/shared';
import { PaginatedQueryDto } from '../common/paginated-query';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; role: string };
}

// TRACED:AE-DS-004
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async create(
    @Body() dto: CreateDataSourceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dataSourceService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }
}

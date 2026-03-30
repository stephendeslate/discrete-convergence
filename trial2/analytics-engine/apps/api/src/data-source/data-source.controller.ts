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
  Header,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:AE-DS-003 — DataSource controller with Cache-Control on list endpoint
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Req() req: AuthenticatedRequest,
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
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }

  @Post(':id/sync')
  async sync(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dataSourceService.sync(id, req.user.tenantId);
  }

  @Get(':id/sync-history')
  @Header('Cache-Control', 'private, max-age=15')
  async syncHistory(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dataSourceService.syncHistory(
      id,
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }
}

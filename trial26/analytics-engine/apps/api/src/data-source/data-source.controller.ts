import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { TenantId } from '../auth/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-API-004 — Data source CRUD + sync endpoints
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.dataSourceService.findAll(tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dataSourceService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dataSourceService.remove(tenantId, id);
  }

  @Post(':id/test-connection')
  testConnection(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dataSourceService.testConnection(tenantId, id);
  }

  @Post(':id/sync')
  sync(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dataSourceService.sync(tenantId, id);
  }
}

// TRACED:AE-PERF-005 — Cache-Control on data source list endpoint
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
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { RequestUser } from '../common/auth-utils';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    const user = req.user as RequestUser;
    return this.dataSourceService.create(
      user.tenantId,
      dto.name,
      dto.type,
      dto.configEncrypted,
      dto.schedule,
    );
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as RequestUser;
    return this.dataSourceService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dataSourceService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateDataSourceDto) {
    const user = req.user as RequestUser;
    return this.dataSourceService.update(id, user.tenantId, dto.name, dto.schedule);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dataSourceService.remove(id, user.tenantId);
  }

  @Post(':id/sync')
  triggerSync(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.dataSourceService.triggerSync(id, user.tenantId);
  }

  @Get(':id/sync-history')
  @Header('Cache-Control', 'private, max-age=15')
  getSyncHistory(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as RequestUser;
    return this.dataSourceService.getSyncHistory(id, user.tenantId, query.page, query.pageSize);
  }
}

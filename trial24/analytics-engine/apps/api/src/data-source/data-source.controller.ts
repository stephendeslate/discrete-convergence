// TRACED:DATASOURCE-CONTROLLER — REST endpoints for data sources
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser } from '../common/auth-utils';
import { Request } from 'express';

@Controller('data-sources')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  create(@Body() dto: CreateDataSourceDto, @Req() req: Request) {
    const user = extractUser(req);
    return this.dataSourceService.create(dto, user.tenantId);
  }

  @Get()
  findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.dataSourceService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.dataSourceService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDataSourceDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.dataSourceService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.dataSourceService.remove(id, user.tenantId);
  }
}

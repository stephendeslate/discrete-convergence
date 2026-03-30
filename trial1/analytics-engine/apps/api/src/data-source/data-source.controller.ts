// TRACED:AE-API-003 — DataSource CRUD controller with sync trigger
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
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(getTenantId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const params = parsePaginationParams(page, limit);
    return this.dataSourceService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.remove(getTenantId(req), id);
  }

  @Post(':id/sync')
  async triggerSync(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.triggerSync(getTenantId(req), id);
  }
}

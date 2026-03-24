// TRACED:AE-DS-003 — DataSource controller with CRUD + sync
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(
    @Body() dto: CreateDataSourceDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.create(dto, req.user.tenantId);
  }

  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    res?.setHeader('Cache-Control', 'private, max-age=30');
    return this.dataSourceService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }

  @Post(':id/sync')
  async triggerSync(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dataSourceService.triggerSync(id, req.user.tenantId);
  }

  @Get(':id/sync-history')
  async getSyncHistory(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    res?.setHeader('Cache-Control', 'private, max-age=15');
    return this.dataSourceService.getSyncHistory(
      id,
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }
}

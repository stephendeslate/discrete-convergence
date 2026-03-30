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
import { Roles } from '../common/roles.decorator';
import { extractUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/pagination.utils';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.dataSourceService.findAll(user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.dataSourceService.findOne(user.organizationId, id);
  }

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    const user = extractUser(req);
    return this.dataSourceService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    const user = extractUser(req);
    return this.dataSourceService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.dataSourceService.remove(user.organizationId, id);
  }

  @Post(':id/sync')
  @Roles('ADMIN', 'ORGANIZER')
  async sync(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.dataSourceService.sync(user.organizationId, id);
  }

  @Get(':id/sync-history')
  async getSyncHistory(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.dataSourceService.getSyncHistory(
      user.organizationId,
      id,
      query.page,
      query.limit,
    );
  }
}

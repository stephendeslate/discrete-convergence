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

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, no-cache');
    return this.dataSourceService.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.remove(user.tenantId, id);
  }

  @Post(':id/sync')
  async triggerSync(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.triggerSync(user.tenantId, id);
  }
}

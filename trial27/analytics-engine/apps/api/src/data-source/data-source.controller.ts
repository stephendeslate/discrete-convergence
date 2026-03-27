import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.findOne(user.tenantId, id);
  }

  @Put(':id')
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

  @Post(':id/test-connection')
  async testConnection(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.testConnection(user.tenantId, id);
  }

  @Post(':id/sync')
  async sync(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.dataSourceService.sync(user.tenantId, id);
  }
}

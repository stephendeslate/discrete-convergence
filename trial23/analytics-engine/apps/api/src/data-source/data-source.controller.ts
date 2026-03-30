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
} from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dataSourceService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }

  @Post(':id/sync')
  async sync(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dataSourceService.sync(id, req.user.tenantId);
  }

  @Get(':id/sync-history')
  async getSyncHistory(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dataSourceService.getSyncHistory(
      id,
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }
}

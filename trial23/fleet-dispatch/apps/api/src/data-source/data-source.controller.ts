import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Roles('ADMIN')
  @Post()
  create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(req.user.companyId, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dataSourceService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN')
  @Post(':id/test')
  testConnection(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.testConnection(req.user.companyId, id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.dataSourceService.remove(req.user.companyId, id);
  }
}

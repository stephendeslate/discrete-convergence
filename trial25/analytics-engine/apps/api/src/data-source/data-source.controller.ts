// TRACED:DS-CTRL — Data source controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { AuthUser } from '../common/auth-utils';

/**
 * Data source CRUD controller.
 * TRACED:AE-DS-CTRL-001 — Data source controller with auth guards
 */
@Controller('data-sources')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthUser;
    return this.dataSourceService.findAll(user.tenantId, query.page, query.limit);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    const user = req.user as AuthUser;
    return this.dataSourceService.create(dto, user.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dataSourceService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    const user = req.user as AuthUser;
    return this.dataSourceService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dataSourceService.remove(id, user.tenantId);
  }

  @Post(':id/sync')
  async sync(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dataSourceService.sync(id, user.tenantId);
  }

  @Post(':id/test-connection')
  async testConnection(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.dataSourceService.testConnection(id, user.tenantId);
  }
}

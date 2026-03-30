// TRACED:AE-API-002 — DataSource endpoints with JWT + RBAC guards and tenant isolation
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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { DataSourceService } from './data-source.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import type { CreateDataSourceDto } from './dto/create-data-source.dto';
import type { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  @Roles('ADMIN', 'USER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateDataSourceDto) {
    return this.dataSourceService.create(getTenantId(req), dto);
  }

  @Get()
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params = parsePaginationParams(page, limit);
    return this.dataSourceService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dataSourceService.findOne(getTenantId(req), id);
  }

  @Put(':id')
  @Roles('ADMIN', 'USER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.dataSourceService.remove(getTenantId(req), id);
  }
}

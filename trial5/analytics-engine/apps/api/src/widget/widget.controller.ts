// TRACED:AE-API-003 — Widget endpoints with JWT + RBAC guards and tenant isolation
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
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import type { CreateWidgetDto } from './dto/create-widget.dto';
import type { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller('widgets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  @Roles('ADMIN', 'USER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(getTenantId(req), dto);
  }

  @Get()
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findAll(
    @Req() req: Request,
    @Query('dashboardId') dashboardId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params = parsePaginationParams(page, limit);
    return this.widgetService.findAll(getTenantId(req), dashboardId, params.page, params.limit);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'VIEWER')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.widgetService.findOne(getTenantId(req), id);
  }

  @Put(':id')
  @Roles('ADMIN', 'USER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.widgetService.remove(getTenantId(req), id);
  }
}

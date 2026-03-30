// TRACED:AE-PERF-004 — Cache-Control on widget list endpoint
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
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { RequestUser } from '../common/auth-utils';

@Controller('dashboards/:dashboardId/widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(
    @Req() req: Request,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    const user = req.user as RequestUser;
    return this.widgetService.create(
      dashboardId,
      user.tenantId,
      dto.title,
      dto.type,
      dto.dataSourceId,
      dto.gridColumn,
      dto.gridRow,
      dto.gridWidth,
      dto.gridHeight,
    );
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Req() req: Request,
    @Param('dashboardId') dashboardId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as RequestUser;
    return this.widgetService.findAll(dashboardId, user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.widgetService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    const user = req.user as RequestUser;
    return this.widgetService.update(
      id,
      user.tenantId,
      dto.title,
      dto.gridColumn,
      dto.gridRow,
      dto.gridWidth,
      dto.gridHeight,
    );
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as RequestUser;
    return this.widgetService.remove(id, user.tenantId);
  }
}

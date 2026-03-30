// TRACED:WIDGET-CONTROLLER — REST endpoints for widgets
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser } from '../common/auth-utils';
import { Request } from 'express';

@Controller('widgets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto, @Req() req: Request) {
    const user = extractUser(req);
    return this.widgetService.create(dto, user.tenantId);
  }

  @Get('dashboard/:dashboardId')
  findByDashboard(
    @Param('dashboardId', ParseUUIDPipe) dashboardId: string,
    @Query() query: PaginatedQuery,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.widgetService.findByDashboard(dashboardId, user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.widgetService.findOne(id, user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWidgetDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.widgetService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.widgetService.remove(id, user.tenantId);
  }
}

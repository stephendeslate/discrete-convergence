import { Controller, Get, Post, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

/**
 * VERIFY: AE-WIDGET-004 — widget endpoints nested under dashboards
 */
@Controller('dashboards/:dashboardId/widgets') // TRACED: AE-WIDGET-004
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(req.user.tenantId, dashboardId, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Param('dashboardId') dashboardId: string) {
    return this.widgetService.findAll(req.user.tenantId, dashboardId);
  }

  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
  ) {
    return this.widgetService.findOne(req.user.tenantId, dashboardId, id);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(req.user.tenantId, dashboardId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
  ) {
    return this.widgetService.remove(req.user.tenantId, dashboardId, id);
  }
}

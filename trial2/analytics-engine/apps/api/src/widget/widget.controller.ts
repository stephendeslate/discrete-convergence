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
  Header,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto, UpdateWidgetPositionDto } from './dto/update-widget.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:AE-WIDG-002 — Widget controller with Cache-Control on list endpoint
@Controller()
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('dashboards/:dashboardId/widgets')
  async create(
    @Param('dashboardId') dashboardId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(dashboardId, req.user.tenantId, dto);
  }

  @Get('dashboards/:dashboardId/widgets')
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Param('dashboardId') dashboardId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.widgetService.findAll(
      dashboardId,
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get('widgets/:id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Patch('widgets/:id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(id, req.user.tenantId, dto);
  }

  @Patch('widgets/:id/position')
  async updatePosition(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateWidgetPositionDto,
  ) {
    return this.widgetService.updatePosition(id, req.user.tenantId, dto);
  }

  @Delete('widgets/:id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}

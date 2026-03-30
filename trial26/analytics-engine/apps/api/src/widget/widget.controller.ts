import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { TenantId } from '../auth/tenant.decorator';

// TRACED: AE-API-003 — Widget CRUD endpoints
@Controller()
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('dashboards/:dashboardId/widgets')
  create(
    @TenantId() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(tenantId, dashboardId, dto);
  }

  @Get('dashboards/:dashboardId/widgets')
  findAll(
    @TenantId() tenantId: string,
    @Param('dashboardId') dashboardId: string,
  ) {
    return this.widgetService.findAllForDashboard(tenantId, dashboardId);
  }

  @Get('widgets/:id/data')
  getWidgetData(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.widgetService.getWidgetData(tenantId, id);
  }

  @Patch('widgets/:id/position')
  updatePosition(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.updatePosition(tenantId, id, dto);
  }

  @Delete('widgets/:id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.widgetService.remove(tenantId, id);
  }
}

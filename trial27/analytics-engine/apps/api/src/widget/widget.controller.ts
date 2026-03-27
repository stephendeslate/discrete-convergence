import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller()
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('dashboards/:dashboardId/widgets')
  async create(
    @Req() req: Request,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.widgetService.create(user.tenantId, dashboardId, dto);
  }

  @Get('dashboards/:dashboardId/widgets')
  async findByDashboard(
    @Req() req: Request,
    @Param('dashboardId') dashboardId: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.widgetService.findByDashboard(user.tenantId, dashboardId);
  }

  @Get('widgets/:id/data')
  async getWidgetData(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.widgetService.getWidgetData(user.tenantId, id);
  }

  @Put('widgets/:id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.widgetService.update(user.tenantId, id, dto);
  }

  @Delete('widgets/:id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.widgetService.remove(user.tenantId, id);
  }
}

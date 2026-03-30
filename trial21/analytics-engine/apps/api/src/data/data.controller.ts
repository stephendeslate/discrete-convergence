import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { DataService } from './data.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

@Controller('data') // TRACED: AE-DATA-004
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('preview/:dataSourceId')
  async preview(@Req() req: AuthenticatedRequest, @Param('dataSourceId') dataSourceId: string, @Query('limit') limit?: string) {
    return this.dataService.preview(req.user.tenantId, dataSourceId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('widget/:dashboardId/:widgetId')
  async widgetData(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.dataService.getWidgetData(req.user.tenantId, dashboardId, widgetId);
  }
}

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

// TRACED:AE-API-003 — widget CRUD endpoints
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    const user = req.user as { tenantId: string };
    return this.widgetService.create(user.tenantId, dto);
  }

  @Get('dashboard/:dashboardId')
  async findAllByDashboard(
    @Req() req: Request,
    @Param('dashboardId') dashboardId: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.widgetService.findAllByDashboard(user.tenantId, dashboardId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.widgetService.findOne(user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.widgetService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.widgetService.remove(user.tenantId, id);
  }
}

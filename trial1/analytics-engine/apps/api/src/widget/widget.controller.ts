// TRACED:AE-API-002 — Widget CRUD controller nested under dashboards
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller()
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('dashboards/:dashboardId/widgets')
  async create(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(dashboardId, dto);
  }

  @Get('dashboards/:dashboardId/widgets')
  async findAll(
    @Param('dashboardId') dashboardId: string,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return this.widgetService.findAll(
      dashboardId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Patch('widgets/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetService.update(id, dto);
  }

  @Delete('widgets/:id')
  async remove(@Param('id') id: string) {
    return this.widgetService.remove(id);
  }
}

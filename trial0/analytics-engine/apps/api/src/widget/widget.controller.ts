import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('dashboards/:dashboardId/widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.create(dashboardId, dto, req.user.tenantId);
  }

  @Get()
  async findAll(
    @Param('dashboardId') dashboardId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.findAll(dashboardId, req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.remove(id, req.user.tenantId);
  }

  @Patch(':id/position')
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.updatePosition(id, dto, req.user.tenantId);
  }
}

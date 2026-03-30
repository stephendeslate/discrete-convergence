import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '@analytics-engine/shared';

// TRACED: AE-API-005
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'no-store');
    return this.widgetService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(id, req.user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}

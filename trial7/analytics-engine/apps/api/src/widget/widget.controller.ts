import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, Header } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; role: string };
}

// TRACED:AE-WIDG-003
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(
    @Body() dto: CreateWidgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.widgetService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.widgetService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.widgetService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}

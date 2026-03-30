// TRACED:WIDGET-CTRL — Widget controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { AuthUser } from '../common/auth-utils';

/**
 * Widget CRUD controller.
 * TRACED:AE-WID-CTRL-001 — Widget controller with auth guards
 */
@Controller('widgets')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthUser;
    return this.widgetService.findAll(user.tenantId, query.page, query.limit);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    const user = req.user as AuthUser;
    return this.widgetService.create(dto, user.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.widgetService.findOne(id, user.tenantId);
  }

  @Get(':id/data')
  async getWidgetData(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.widgetService.getWidgetData(id, user.tenantId);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    const user = req.user as AuthUser;
    return this.widgetService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.widgetService.remove(id, user.tenantId);
  }
}

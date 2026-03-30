import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-WIDGET-002
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.widgetService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.remove(req.user.tenantId, id);
  }
}

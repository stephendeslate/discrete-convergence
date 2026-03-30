import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.widgetService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Get(':id/data')
  async getWidgetData(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.widgetService.getWidgetData(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}

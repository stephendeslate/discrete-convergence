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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/request-with-user';

// TRACED: AE-API-005
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto, @Req() req: RequestWithUser) {
    return this.widgetService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.widgetService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.widgetService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
    @Req() req: RequestWithUser,
  ) {
    return this.widgetService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.widgetService.remove(id, req.user.tenantId);
  }
}

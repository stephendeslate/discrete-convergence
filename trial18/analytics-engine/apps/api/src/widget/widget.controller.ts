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
  Header,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { Roles } from '../auth/roles.decorator';

// TRACED: AE-API-005 — WidgetController provides full CRUD with @Roles('ADMIN') on delete

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto, @Req() req: RequestWithUser) {
    return this.widgetService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.widgetService.findAll(req.user.tenantId, query);
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
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}

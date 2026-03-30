import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-EVENT-002
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'max-age=30, public')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.eventService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: RequestWithUser) {
    return this.eventService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventService.remove(id, req.user.tenantId);
  }
}

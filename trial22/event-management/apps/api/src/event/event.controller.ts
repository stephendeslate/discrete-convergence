import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';

// TRACED: EM-EVENT-002
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.eventService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateEventDto) {
    return this.eventService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, req.user.tenantId, dto);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.remove(id, req.user.tenantId);
  }
}

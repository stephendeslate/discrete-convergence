import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: EM-EVENT-002
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    const res = req.res;
    if (res) {
      res.setHeader('Cache-Control', 'public, max-age=60');
    }
    return this.eventService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'EDITOR')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: RequestWithUser) {
    return this.eventService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventService.remove(id, req.user.tenantId);
  }
}

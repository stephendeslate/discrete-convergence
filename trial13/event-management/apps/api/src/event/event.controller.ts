import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Request } from 'express';
import { JwtPayload } from '@event-management/shared';

// TRACED: EM-EVENT-002
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles('ADMIN')
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const user = req.user as JwtPayload;
    return this.eventService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.eventService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.eventService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    const user = req.user as JwtPayload;
    return this.eventService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.eventService.remove(user.tenantId, id);
  }
}

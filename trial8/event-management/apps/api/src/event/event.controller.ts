import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    const result = await this.eventService.findAll(user.tenantId, query.page, query.pageSize);
    return {
      ...result,
      _cache: 'max-age=60',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.remove(id, user.tenantId);
  }
}

// TRACED:EM-API-002 — EventController with RBAC guards and tenant-scoped access
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(
    @Body() dto: CreateEventDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    dto.tenantId = req.user.tenantId;
    return this.eventService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.eventService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.eventService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.eventService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.eventService.remove(id, req.user.tenantId);
  }
}

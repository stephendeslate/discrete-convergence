// TRACED:EM-API-001 — Event CRUD endpoints (no @UseGuards — relies on global APP_GUARD)
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Header } from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = req.user as { organizationId: string; userId: string };
    return this.eventService.create(dto, user.organizationId);
  }

  // TRACED:EM-PERF-003 — Cache-Control header on list endpoint
  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.update(id, dto, user.organizationId);
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.publish(id, user.organizationId);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.cancel(id, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.eventService.remove(id, user.organizationId);
  }

  @Public()
  @SkipThrottle()
  @Get('/public/discovery')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  async publicDiscovery(@Query() query: PaginatedQueryDto) {
    return this.eventService.findPublicEvents(query.page, query.pageSize);
  }
}

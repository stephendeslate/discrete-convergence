// TRACED:EM-EVENT-005 — Event controller with CRUD + publish/cancel + public routes
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { Public } from '../common/public.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Response as ExpressResponse } from 'express';
import { Res } from '@nestjs/common';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('events')
  async create(
    @Body() dto: CreateEventDto,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.create(dto, req.user.organizationId);
  }

  @Get('events')
  async findAll(
    @Request() req: { user: { organizationId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: ExpressResponse,
  ) {
    // TRACED:EM-PERF-004 — Cache-Control on list endpoint
    res?.setHeader('Cache-Control', 'public, max-age=60');
    return this.eventService.findAll(
      req.user.organizationId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('events/:id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.findOne(id, req.user.organizationId);
  }

  @Patch('events/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.update(id, dto, req.user.organizationId);
  }

  @Delete('events/:id')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.delete(id, req.user.organizationId);
  }

  @Patch('events/:id/publish')
  async publish(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.publish(id, req.user.organizationId);
  }

  @Patch('events/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.eventService.cancel(id, req.user.organizationId);
  }

  @Public()
  @Get('public/events')
  async findPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: ExpressResponse,
  ) {
    res?.setHeader('Cache-Control', 'public, max-age=120');
    return this.eventService.findPublic(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Public()
  @Get('public/events/:orgSlug/:eventSlug')
  async findBySlug(
    @Param('orgSlug') orgSlug: string,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.eventService.findBySlug(orgSlug, eventSlug);
  }
}

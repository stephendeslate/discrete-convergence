// TRACED:EM-API-001 — Event CRUD with status transition validation
// TRACED:EM-API-006 — Cache-Control headers on list endpoints
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { getOrganizationId } from '../common/auth-utils';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    return this.eventService.create(getOrganizationId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=60');
    return this.eventService.findAll(getOrganizationId(req), Number(page), Number(pageSize));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.eventService.findOne(getOrganizationId(req), id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(getOrganizationId(req), id, dto);
  }

  @Patch(':id/status')
  transitionStatus(@Req() req: Request, @Param('id') id: string, @Body('status') status: string) {
    return this.eventService.transitionStatus(getOrganizationId(req), id, status);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.eventService.remove(getOrganizationId(req), id);
  }
}

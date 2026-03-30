// TRACED: EM-API-001 — Event CRUD controller with full endpoints
// TRACED: EM-API-006 — Cache-Control headers on list endpoints
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import { Roles } from '../common/roles.decorator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateEventDto) {
    return this.eventService.create(getTenantId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const params = parsePaginationParams(page, limit);
    return this.eventService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.eventService.findOne(getTenantId(req), id);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(getTenantId(req), id, dto);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.eventService.remove(getTenantId(req), id);
  }
}

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
import { Roles } from '../common/roles.decorator';
import { extractUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/pagination.utils';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.eventService.findAll(user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.eventService.findOne(user.organizationId, id);
  }

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const user = extractUser(req);
    return this.eventService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const user = extractUser(req);
    return this.eventService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.eventService.remove(user.organizationId, id);
  }

  @Patch(':id/publish')
  @Roles('ADMIN', 'ORGANIZER')
  async publish(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.eventService.publish(user.organizationId, id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'ORGANIZER')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.eventService.cancel(user.organizationId, id);
  }
}

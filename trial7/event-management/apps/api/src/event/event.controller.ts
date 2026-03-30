import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

// TRACED:EM-EVT-004
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.create(dto, user.userId, user.tenantId);
  }

  // TRACED:EM-PERF-004
  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser;
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.eventService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.remove(id, user.tenantId);
  }

  // TRACED:EM-SEC-005
  @Get('stats/summary')
  @Roles('ADMIN')
  async stats(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.getEventStats(user.tenantId);
  }
}

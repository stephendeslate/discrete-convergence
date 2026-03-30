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
import { Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RequestWithUser } from '../common/request-with-user';
import { Roles } from '../common/roles.decorator';
import { PaginatedQuery } from '../common/paginated-query';

// TRACED: EM-EVENT-004
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateEventDto) {
    return this.eventService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.eventService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(req.user.tenantId, id, dto);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.remove(req.user.tenantId, id);
  }

  @Get('stats/summary')
  getStats(@Req() req: RequestWithUser) {
    return this.eventService.getEventStats(req.user.tenantId);
  }
}

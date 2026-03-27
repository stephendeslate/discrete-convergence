// TRACED: EM-API-003 — Event controller with CRUD + publish/cancel actions
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
} from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthenticatedUser } from '../common/auth-utils';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateEventDto) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findAll(user.tenantId, page, pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.update(user.tenantId, id, dto);
  }

  @Post(':id/publish')
  async publish(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.publish(user.tenantId, id);
  }

  @Post(':id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.cancel(user.tenantId, id);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.eventService.remove(user.tenantId, id);
  }
}

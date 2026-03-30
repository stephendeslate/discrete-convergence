// TRACED:EM-EVT-002
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
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';
import { PaginatedResult } from '../common/pagination.utils';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(
    @Body() dto: CreateEventDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.create(dto, user.organizationId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findAll(user.organizationId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.remove(id, user.organizationId);
  }

  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.publish(id, user.organizationId);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.eventService.cancel(id, user.organizationId);
  }
}

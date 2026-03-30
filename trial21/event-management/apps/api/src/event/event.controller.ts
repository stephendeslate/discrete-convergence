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
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

/** TRACED:EM-EVT-003 — Event CRUD controller */
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post()
  async create(
    @Body() dto: CreateEventDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.create(dto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.findAll(req.user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.findOne(id, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.update(id, dto, req.user.organizationId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.remove(id, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.publish(id, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.eventService.cancel(id, req.user.organizationId);
  }
}

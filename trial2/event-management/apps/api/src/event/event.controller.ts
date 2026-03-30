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
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:EM-API-002 — Events CRUD with publish/cancel endpoints

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() dto: CreateEventDto, @Req() req: AuthenticatedRequest) {
    return this.eventService.create(dto, req.user.organizationId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: AuthenticatedRequest) {
    return this.eventService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.eventService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.eventService.remove(id, req.user.organizationId);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.eventService.publish(id, req.user.organizationId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.eventService.cancel(id, req.user.organizationId, req.user.sub);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { EventService } from '../event/event.service';
import { PaginatedQueryDto } from '../common/paginated-query';

/** TRACED:EM-EVT-006 — Public event discovery */
@Controller('public')
@Public()
export class PublicEventController {
  constructor(private readonly eventService: EventService) {}

  @Get('events')
  async findAll(@Query() query: PaginatedQueryDto) {
    return this.eventService.findPublicEvents(query.page, query.limit);
  }

  @Get('events/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }
}

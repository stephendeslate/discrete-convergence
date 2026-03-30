import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

// TRACED: EM-VENUE-002
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.venueService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.venueService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateVenueDto) {
    return this.venueService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venueService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.venueService.remove(id, req.user.tenantId);
  }
}

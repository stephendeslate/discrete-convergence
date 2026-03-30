import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { RequestWithUser } from '../common/request-with-user';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: EM-VENUE-003
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  create(@Req() req: RequestWithUser, @Body() dto: CreateVenueDto) {
    return this.venueService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.venueService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.venueService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
  ) {
    return this.venueService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.venueService.remove(req.user.tenantId, id);
  }
}

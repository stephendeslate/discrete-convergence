import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: EM-VENUE-002
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    const res = req.res;
    if (res) {
      res.setHeader('Cache-Control', 'public, max-age=60');
    }
    return this.venueService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.venueService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateVenueDto, @Req() req: RequestWithUser) {
    return this.venueService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'EDITOR')
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto, @Req() req: RequestWithUser) {
    return this.venueService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.venueService.remove(id, req.user.tenantId);
  }
}

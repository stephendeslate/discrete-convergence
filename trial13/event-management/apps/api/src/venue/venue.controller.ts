import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Request } from 'express';
import { JwtPayload } from '@event-management/shared';

// TRACED: EM-VENUE-002
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @Roles('ADMIN')
  create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    const user = req.user as JwtPayload;
    return this.venueService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.venueService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.venueService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
    const user = req.user as JwtPayload;
    return this.venueService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.venueService.remove(user.tenantId, id);
  }
}

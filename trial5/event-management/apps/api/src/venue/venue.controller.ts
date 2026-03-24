// TRACED:EM-API-004 — VenueController with RBAC guards and tenant-scoped access
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(
    @Body() dto: CreateVenueDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    dto.tenantId = req.user.tenantId;
    return this.venueService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.venueService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.venueService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.venueService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.venueService.remove(id, req.user.tenantId);
  }
}

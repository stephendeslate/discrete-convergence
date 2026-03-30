// TRACED:VENUE-CONTROLLER
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto, UpdateVenueDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole } from '../common/auth-utils';

@Controller('venues')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  async create(@Body() dto: CreateVenueDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.venueService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.venueService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.venueService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.venueService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.venueService.remove(id, user.organizationId);
  }
}

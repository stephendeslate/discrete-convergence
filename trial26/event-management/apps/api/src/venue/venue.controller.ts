// TRACED:EM-VEN-001 TRACED:EM-VEN-003
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('venues')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.venueService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    const user = getAuthUser(req);
    return this.venueService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.venueService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
    const user = getAuthUser(req);
    return this.venueService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.venueService.remove(id, user.tenantId, user.userId);
  }
}

import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateVenueDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    const result = await this.venueService.findAll(user.tenantId, query.page, query.pageSize);
    return {
      ...result,
      _cache: 'max-age=60',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findOne(id, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.remove(id, user.tenantId);
  }
}

// TRACED:EM-API-003 — Venue CRUD endpoints (no @UseGuards)
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Header } from '@nestjs/common';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  async create(@Body() dto: CreateVenueDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.venueService.create(dto, user.organizationId);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.venueService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.venueService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVenueDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.venueService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.venueService.remove(id, user.organizationId);
  }
}

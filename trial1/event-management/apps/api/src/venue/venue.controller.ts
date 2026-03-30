// TRACED:EM-API-003 — Venue CRUD controller
// TRACED:EM-API-006 — Cache-Control headers on list endpoints
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { getOrganizationId } from '../common/auth-utils';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    return this.venueService.create(getOrganizationId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=60');
    return this.venueService.findAll(getOrganizationId(req), Number(page), Number(pageSize));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.venueService.findOne(getOrganizationId(req), id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venueService.update(getOrganizationId(req), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.venueService.remove(getOrganizationId(req), id);
  }
}

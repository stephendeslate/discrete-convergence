import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, Res } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  async create(
    @Body() dto: CreateVenueDto,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.venueService.create(dto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Request() req: { user: { organizationId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: ExpressResponse,
  ) {
    res?.setHeader('Cache-Control', 'public, max-age=60');
    return this.venueService.findAll(
      req.user.organizationId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.venueService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.venueService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { organizationId: string } },
  ) {
    return this.venueService.delete(id, req.user.organizationId);
  }
}

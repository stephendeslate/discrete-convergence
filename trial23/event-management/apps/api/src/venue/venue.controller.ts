import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Roles } from '../common/roles.decorator';
import { extractUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/pagination.utils';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQuery,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const user = extractUser(req);
    return this.venueService.findAll(user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.venueService.findOne(user.organizationId, id);
  }

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    const user = extractUser(req);
    return this.venueService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
  ) {
    const user = extractUser(req);
    return this.venueService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = extractUser(req);
    return this.venueService.remove(user.organizationId, id);
  }
}

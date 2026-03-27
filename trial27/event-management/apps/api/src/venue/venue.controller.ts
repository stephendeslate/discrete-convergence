// TRACED: EM-API-004 — Venue controller with CRUD
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
} from '@nestjs/common';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { AuthenticatedUser } from '../common/auth-utils';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateVenueDto) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findAll(user.tenantId, page, pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.remove(user.tenantId, id);
  }
}

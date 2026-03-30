// TRACED:EM-VEN-002
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
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';
import { PaginatedResult } from '../common/pagination.utils';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  async create(
    @Body() dto: CreateVenueDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.venueService.create(dto, user.organizationId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findAll(user.organizationId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.venueService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser;
    return this.venueService.remove(id, user.organizationId);
  }
}

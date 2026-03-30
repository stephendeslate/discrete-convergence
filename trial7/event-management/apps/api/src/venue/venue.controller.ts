import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VenueService } from './venue.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

// TRACED:EM-VEN-004
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
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser;
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.venueService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.venueService.remove(id, user.tenantId);
  }
}

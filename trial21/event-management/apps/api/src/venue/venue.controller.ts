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
import { VenueService } from './venue.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post()
  async create(
    @Body() dto: CreateVenueDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.venueService.create(dto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.venueService.findAll(req.user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.venueService.findOne(id, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.venueService.update(id, dto, req.user.organizationId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.venueService.remove(id, req.user.organizationId);
  }
}

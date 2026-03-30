import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/create-venue.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-VENUE-002
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateVenueDto, @Req() req: RequestWithUser) {
    return this.venueService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'max-age=30, public')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.venueService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.venueService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto, @Req() req: RequestWithUser) {
    return this.venueService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.venueService.remove(id, req.user.tenantId);
  }
}

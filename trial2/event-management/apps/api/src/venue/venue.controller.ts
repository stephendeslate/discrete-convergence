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
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { AuthenticatedRequest } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post()
  create(@Body() dto: CreateVenueDto, @Req() req: AuthenticatedRequest) {
    return this.venueService.create(dto, req.user.organizationId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: AuthenticatedRequest) {
    return this.venueService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.venueService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.venueService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.venueService.remove(id, req.user.organizationId);
  }
}

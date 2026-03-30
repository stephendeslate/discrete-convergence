// TRACED:API-TRIP-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { CurrentUser, RolesGuard, Roles } from '../common/auth-utils';
import type { JwtPayload } from '../common/auth-utils';

@Controller('trips')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @CurrentUser() user: JwtPayload) {
    return this.tripService.findAll(user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.tripService.findOne(id, user.companyId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateTripDto, @CurrentUser() user: JwtPayload) {
    return this.tripService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripService.update(id, dto, user.companyId);
  }
}

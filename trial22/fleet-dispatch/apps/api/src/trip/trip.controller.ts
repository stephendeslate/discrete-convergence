import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

// TRACED: FD-TRIP-002
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.tripService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tripService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateTripDto, @Req() req: RequestWithUser) {
    return this.tripService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTripDto, @Req() req: RequestWithUser) {
    return this.tripService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tripService.remove(id, req.user.tenantId);
  }
}

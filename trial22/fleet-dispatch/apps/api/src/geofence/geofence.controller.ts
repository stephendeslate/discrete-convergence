import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

@Controller('geofences')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.geofenceService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.geofenceService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateGeofenceDto, @Req() req: RequestWithUser) {
    return this.geofenceService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.geofenceService.remove(id, req.user.tenantId);
  }
}

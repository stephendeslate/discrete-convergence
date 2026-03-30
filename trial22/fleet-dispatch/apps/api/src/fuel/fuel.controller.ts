import {
  Controller, Get, Post, Delete, Body, Param, Query, Req, UseInterceptors,
} from '@nestjs/common';
import { FuelService } from './fuel.service';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

// TRACED: FD-FUEL-002
@Controller('fuel-logs')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.fuelService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.fuelService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateFuelLogDto, @Req() req: RequestWithUser) {
    return this.fuelService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.fuelService.remove(id, req.user.tenantId);
  }
}

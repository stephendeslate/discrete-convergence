import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';

// TRACED: FD-DRV-002
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.driverService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.driverService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateDriverDto, @Req() req: RequestWithUser) {
    return this.driverService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @Req() req: RequestWithUser) {
    return this.driverService.update(id, dto, req.user.tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.driverService.remove(id, req.user.tenantId);
  }
}

// TRACED: FD-VEH-004
import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/paginated-query';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.vehicleService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(req.user.tenantId, id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.remove(req.user.tenantId, id);
  }

  @Get('stats/summary')
  getStats(@Req() req: RequestWithUser) {
    return this.vehicleService.getVehicleStats(req.user.tenantId);
  }
}

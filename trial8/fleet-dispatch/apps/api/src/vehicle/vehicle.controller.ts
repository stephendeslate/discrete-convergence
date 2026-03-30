import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    const result = await this.vehicleService.findAll(tenantId, query);
    req.res?.setHeader('Cache-Control', 'private, max-age=30');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.vehicleService.findOne(id, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateVehicleDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.vehicleService.create(dto, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.vehicleService.update(id, dto, tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.vehicleService.delete(id, tenantId);
  }
}

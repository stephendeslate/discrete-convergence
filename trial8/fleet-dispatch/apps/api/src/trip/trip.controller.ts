import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto } from './trip.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    const result = await this.tripService.findAll(tenantId, query);
    req.res?.setHeader('Cache-Control', 'private, max-age=30');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.tripService.findOne(id, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateTripDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.tripService.create(dto, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTripDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.tripService.update(id, dto, tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.tripService.delete(id, tenantId);
  }
}

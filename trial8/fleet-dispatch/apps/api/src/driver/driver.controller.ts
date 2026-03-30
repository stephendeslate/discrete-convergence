import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { DriverService } from './driver.service';
import { CreateDriverDto, UpdateDriverDto } from './driver.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    const result = await this.driverService.findAll(tenantId, query);
    req.res?.setHeader('Cache-Control', 'private, max-age=30');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.driverService.findOne(id, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateDriverDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.driverService.create(dto, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.driverService.update(id, dto, tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.driverService.delete(id, tenantId);
  }
}

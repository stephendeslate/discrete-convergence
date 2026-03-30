import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './maintenance.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    const result = await this.maintenanceService.findAll(tenantId, query);
    req.res?.setHeader('Cache-Control', 'private, max-age=30');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.maintenanceService.findOne(id, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateMaintenanceDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.maintenanceService.create(dto, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.maintenanceService.update(id, dto, tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.maintenanceService.delete(id, tenantId);
  }
}

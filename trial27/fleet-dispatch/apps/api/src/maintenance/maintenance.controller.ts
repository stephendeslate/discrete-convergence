// TRACED: FD-API-008 — Maintenance controller under /vehicles/:vehicleId/maintenance
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { TenantId } from '../common/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('vehicles/:vehicleId/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Param('vehicleId') vehicleId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.maintenanceService.findAll(tenantId, vehicleId, query.page, query.pageSize);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.maintenanceService.create(tenantId, vehicleId, dto);
  }
}

// TRACED: FD-API-002 — Vehicle CRUD controller
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { TenantId } from '../common/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.vehicleService.findAll(tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.vehicleService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.vehicleService.remove(tenantId, id);
  }
}

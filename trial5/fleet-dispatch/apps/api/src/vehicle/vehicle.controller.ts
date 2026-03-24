// TRACED:FD-VEH-002 — vehicle controller with RBAC and pagination
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async create(@Body() dto: CreateVehicleDto, @TenantId() tenantId: string) {
    return this.vehicleService.create(dto, tenantId);
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.vehicleService.findAll(
      tenantId,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.vehicleService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @TenantId() tenantId: string,
  ) {
    return this.vehicleService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.vehicleService.remove(id, tenantId);
  }
}

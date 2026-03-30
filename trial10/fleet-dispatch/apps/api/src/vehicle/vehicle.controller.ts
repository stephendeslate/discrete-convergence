// TRACED:FD-API-001 — Vehicle CRUD controller with full endpoints
// TRACED:FD-API-006 — Cache-Control headers on list endpoints
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';
import { Roles } from '../common/roles.decorator';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(getTenantId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const params = parsePaginationParams(page, limit);
    return this.vehicleService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.vehicleService.findOne(getTenantId(req), id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(getTenantId(req), id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.vehicleService.remove(getTenantId(req), id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from '@fleet-dispatch/shared';

// TRACED: FD-VEH-002
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles('admin', 'dispatcher')
  create(@Req() req: Request, @Body() dto: CreateVehicleDto) {
    const user = req.user as JwtPayload;
    return this.vehicleService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.vehicleService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.vehicleService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const user = req.user as JwtPayload;
    return this.vehicleService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.vehicleService.remove(user.tenantId, id);
  }
}

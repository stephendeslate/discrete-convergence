// TRACED:API-VEHICLE-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { CurrentUser, RolesGuard, Roles } from '../common/auth-utils';
import type { JwtPayload } from '../common/auth-utils';

@Controller('vehicles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.findAll(user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.findOne(id, user.companyId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vehicleService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.remove(id, user.companyId);
  }
}

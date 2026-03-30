// TRACED:FD-VEH-006 — Vehicle controller with CRUD + status endpoints
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';
import { IsString, MaxLength } from 'class-validator';

class VehicleIdParam {
  @IsString()
  @MaxLength(36)
  id!: string;
}

@Controller('vehicles')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param() params: VehicleIdParam, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.findOne(params.id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.create(dto, user.tenantId, user.userId);
  }

  @Put(':id')
  update(
    @Param() params: VehicleIdParam,
    @Body() dto: UpdateVehicleDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.update(params.id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  remove(@Param() params: VehicleIdParam, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.remove(params.id, user.tenantId, user.userId);
  }

  @Patch(':id/activate')
  activate(@Param() params: VehicleIdParam, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.activate(params.id, user.tenantId, user.userId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param() params: VehicleIdParam, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.vehicleService.deactivate(params.id, user.tenantId, user.userId);
  }
}

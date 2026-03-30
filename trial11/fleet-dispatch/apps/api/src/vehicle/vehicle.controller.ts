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
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/request-with-user';

// TRACED: FD-API-002
// TRACED: FD-SEC-016
@Controller('vehicles')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.vehicleService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(req.user.tenantId, id, dto);
  }

  // TRACED: FD-API-011
  // TRACED: FD-AUTH-012
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.remove(req.user.tenantId, id);
  }
}

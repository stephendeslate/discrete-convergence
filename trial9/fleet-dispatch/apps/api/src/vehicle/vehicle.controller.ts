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
  Header,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { RequestWithUser, Roles } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: FD-VEH-003
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehicleService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.vehicleService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vehicleService.remove(req.user.tenantId, id);
  }

  @Get('stats/fleet')
  async getFleetStats(@Req() req: RequestWithUser) {
    return this.vehicleService.getFleetStats(req.user.tenantId);
  }
}

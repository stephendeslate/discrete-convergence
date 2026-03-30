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
  UseInterceptors,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';

// TRACED: FD-VEH-002
// TRACED: FD-API-002
// TRACED: FD-API-006
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.vehicleService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.vehicleService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto, @Req() req: RequestWithUser) {
    return this.vehicleService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vehicleService.update(id, dto, req.user.tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.vehicleService.remove(id, req.user.tenantId);
  }
}

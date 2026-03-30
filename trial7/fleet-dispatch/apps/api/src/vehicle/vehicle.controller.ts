import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:FD-VEH-004
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.vehicleService.findAll(
      user.tenantId,
      query.page ? parseInt(query.page, 10) : undefined,
      query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.vehicleService.findOne(id, user.tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @Req() req: Request,
  ) {
    const user = req.user as { tenantId: string };
    return this.vehicleService.update(id, user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.vehicleService.remove(id, user.tenantId);
  }
}

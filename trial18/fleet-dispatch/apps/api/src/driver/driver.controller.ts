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
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from '@fleet-dispatch/shared';

// TRACED: FD-DRV-002
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @Roles('admin', 'dispatcher')
  create(@Req() req: Request, @Body() dto: CreateDriverDto) {
    const user = req.user as JwtPayload;
    return this.driverService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.driverService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.driverService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    const user = req.user as JwtPayload;
    return this.driverService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.driverService.remove(user.tenantId, id);
  }
}

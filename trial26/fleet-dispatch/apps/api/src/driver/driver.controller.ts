// TRACED:FD-DRV-006 — Driver controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('drivers')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.driverService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.driverService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateDriverDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.driverService.create(dto, user.tenantId, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.driverService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.driverService.remove(id, user.tenantId, user.userId);
  }
}

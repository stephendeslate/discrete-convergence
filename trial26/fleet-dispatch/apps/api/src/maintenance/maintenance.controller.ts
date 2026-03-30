// TRACED:FD-MNT-006 — Maintenance controller
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('maintenance')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.maintenanceService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.maintenanceService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateMaintenanceDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.maintenanceService.create(dto, user.tenantId, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.maintenanceService.update(id, dto, user.tenantId, user.userId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.maintenanceService.complete(id, user.tenantId, user.userId);
  }
}

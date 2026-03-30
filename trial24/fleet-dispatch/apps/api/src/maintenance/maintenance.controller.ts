// TRACED:API-MAINTENANCE-CONTROLLER
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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { CurrentUser, RolesGuard, Roles } from '../common/auth-utils';
import type { JwtPayload } from '../common/auth-utils';

@Controller('maintenance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.findAll(user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.findOne(id, user.companyId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.maintenanceService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.remove(id, user.companyId);
  }
}

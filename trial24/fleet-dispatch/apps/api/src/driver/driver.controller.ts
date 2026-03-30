// TRACED:API-DRIVER-CONTROLLER
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
import { DriverService } from './driver.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { CurrentUser, RolesGuard, Roles } from '../common/auth-utils';
import type { JwtPayload } from '../common/auth-utils';

@Controller('drivers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @CurrentUser() user: JwtPayload) {
    return this.driverService.findAll(user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.driverService.findOne(id, user.companyId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: JwtPayload) {
    return this.driverService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driverService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.driverService.remove(id, user.companyId);
  }
}

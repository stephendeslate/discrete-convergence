// TRACED: FD-API-003 — Driver CRUD controller
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { TenantId } from '../common/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDriverDto) {
    return this.driverService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.driverService.findAll(tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.driverService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driverService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.driverService.remove(tenantId, id);
  }
}

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
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { TenantId } from '../auth/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-API-002 — Dashboard CRUD endpoints
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.dashboardService.findAll(tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dashboardService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dashboardService.remove(tenantId, id);
  }

  @Patch(':id/publish')
  publish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dashboardService.publish(tenantId, id);
  }

  @Patch(':id/archive')
  archive(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dashboardService.archive(tenantId, id);
  }
}

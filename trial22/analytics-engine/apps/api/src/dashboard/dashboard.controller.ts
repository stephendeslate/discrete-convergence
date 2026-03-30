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
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-DASH-002
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.dashboardService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateDashboardDto, @Req() req: RequestWithUser) {
    return this.dashboardService.create(dto, req.user.tenantId, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  // TRACED: AE-SEC-009
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}

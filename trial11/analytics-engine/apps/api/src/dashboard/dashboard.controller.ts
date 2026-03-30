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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { RequestWithUser } from '../common/auth-utils';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-DASH-004
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Body() dto: CreateDashboardDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.create(dto, req.user.userId, req.user.tenantId);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    const result = await this.dashboardService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  // TRACED: AE-DASH-005
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.dashboardService.remove(id, req.user.tenantId);
  }
}

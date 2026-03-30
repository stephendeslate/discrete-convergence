import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  create(
    @Request() req: { user: { sub: string; companyId: string } },
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardService.create(req.user.companyId, req.user.sub, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dashboardService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.dashboardService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Delete(':id')
  remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.dashboardService.remove(req.user.companyId, id);
  }
}

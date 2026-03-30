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
  Header,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { Roles } from '../auth/roles.decorator';

// TRACED: AE-API-003 — DashboardController scopes all operations by tenant from req.user.tenantId
// TRACED: AE-SEC-003 — DashboardController extracts tenant context from req.user.tenantId for all operations

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Body() dto: CreateDashboardDto, @Req() req: RequestWithUser) {
    return this.dashboardService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.dashboardService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.findOne(id, req.user.tenantId);
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
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}

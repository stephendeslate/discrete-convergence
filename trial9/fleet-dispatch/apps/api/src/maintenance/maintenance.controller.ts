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
  Header,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { RequestWithUser, Roles } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: FD-MNT-003
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.maintenanceService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.maintenanceService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.maintenanceService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.maintenanceService.remove(req.user.tenantId, id);
  }
}

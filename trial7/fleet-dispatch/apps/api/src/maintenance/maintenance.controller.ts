import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:FD-MNT-004
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  async create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.maintenanceService.findAll(
      user.tenantId,
      query.page ? parseInt(query.page, 10) : undefined,
      query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.maintenanceService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @Req() req: Request,
  ) {
    const user = req.user as { tenantId: string };
    return this.maintenanceService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.maintenanceService.remove(id, user.tenantId);
  }
}

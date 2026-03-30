import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Technician management endpoints.
 * TRACED: FD-TECH-002
 */
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTechnicianDto) {
    const user = getUser(req);
    return this.technicianService.create(user.tenantId, user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getUser(req);
    return this.technicianService.findAll(
      user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get('available')
  async findAvailable(@Req() req: Request) {
    const user = getUser(req);
    return this.technicianService.findAvailable(user.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.technicianService.findOne(user.tenantId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    const user = getUser(req);
    return this.technicianService.update(user.tenantId, id, dto);
  }

  @Get(':id/schedule')
  async getSchedule(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    const user = getUser(req);
    return this.technicianService.getSchedule(user.tenantId, id, date);
  }

  @Patch(':id/gps')
  async updateGps(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateGpsDto,
  ) {
    const user = getUser(req);
    return this.technicianService.updateGps(
      user.tenantId,
      id,
      dto.latitude,
      dto.longitude,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

/**
 * Technician controller — CRUD, availability, schedule.
 * TRACED:FD-TECH-002
 */
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.technicianService.create(req.user.companyId, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.technicianService.findAll(req.user.companyId, query.page, query.pageSize);
  }

  @Get('available')
  async findAvailable(
    @Request() req: { user: { companyId: string } },
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=15');
    return this.technicianService.findAvailable(req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.technicianService.findOne(req.user.companyId, id);
  }

  @Get(':id/schedule')
  async getSchedule(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.technicianService.getSchedule(req.user.companyId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicianService.update(req.user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.technicianService.remove(req.user.companyId, id);
  }
}

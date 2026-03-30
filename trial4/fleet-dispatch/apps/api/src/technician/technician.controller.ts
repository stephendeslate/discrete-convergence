// TRACED:FD-PRF-004 — Cache-Control on technician list endpoint
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTechnicianDto) {
    const user = req.user as { companyId: string };
    return this.technicianService.create(user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query: PaginatedQueryDto) {
    const user = req.user as { companyId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.technicianService.findAll(user.companyId, query.page, query.pageSize);
  }

  @Get('available')
  async findAvailable(@Req() req: Request) {
    const user = req.user as { companyId: string };
    return this.technicianService.findAvailable(user.companyId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.technicianService.findOne(user.companyId, id);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    const user = req.user as { companyId: string };
    return this.technicianService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.technicianService.remove(user.companyId, id);
  }
}

// TRACED:FD-API-002 — WorkOrder controller with CRUD + status + assign endpoints
// TRACED:FD-PRF-003 — Cache-Control on list endpoint
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignDto } from './dto/assign.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWorkOrderDto) {
    const user = req.user as { companyId: string; userId: string };
    return this.workOrderService.create(user.companyId, user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query: PaginatedQueryDto) {
    const user = req.user as { companyId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.workOrderService.findAll(user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.workOrderService.findOne(user.companyId, id);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    const user = req.user as { companyId: string };
    return this.workOrderService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.workOrderService.remove(user.companyId, id);
  }

  @Patch(':id/status')
  async updateStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const user = req.user as { companyId: string; userId: string };
    return this.workOrderService.updateStatus(user.companyId, id, dto.status, user.userId);
  }

  @Post(':id/assign')
  async assign(@Req() req: Request, @Param('id') id: string, @Body() dto: AssignDto) {
    const user = req.user as { companyId: string; userId: string };
    return this.workOrderService.assign(user.companyId, id, dto.technicianId, user.userId);
  }
}

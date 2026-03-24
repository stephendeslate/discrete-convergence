// TRACED:FD-WO-005
// TRACED:FD-PERF-004
import { Controller, Get, Post, Patch, Body, Param, Query, Request, Header } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderStatus } from '@prisma/client';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.create(dto, req.user.companyId, req.user.sub);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=10')
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.workOrderService.findAll(req.user.companyId, Number(page), Number(limit));
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.findById(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.update(id, dto, req.user.companyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.updateStatus(id, status, req.user.companyId, req.user.sub);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.assign(id, technicianId, req.user.companyId, req.user.sub);
  }
}

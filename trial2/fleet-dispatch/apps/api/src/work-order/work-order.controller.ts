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
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignDto } from './dto/assign.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Response as ExpressResponse } from 'express';
import { Res } from '@nestjs/common';

/**
 * Work order controller with full CRUD + status transitions + assignment.
 * TRACED:FD-WO-003
 */
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  async create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrderService.create(req.user.companyId, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.workOrderService.findAll(req.user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrderService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrderService.update(req.user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrderService.remove(req.user.companyId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: { user: { companyId: string; userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.workOrderService.updateStatus(
      req.user.companyId,
      id,
      dto.status,
      req.user.userId,
    );
  }

  @Post(':id/assign')
  async assign(
    @Request() req: { user: { companyId: string; userId: string } },
    @Param('id') id: string,
    @Body() dto: AssignDto,
  ) {
    return this.workOrderService.assign(
      req.user.companyId,
      id,
      dto.technicianId,
      req.user.userId,
    );
  }
}

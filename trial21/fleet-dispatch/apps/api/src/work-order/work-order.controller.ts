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
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Work order management endpoints.
 * TRACED: FD-WO-003
 */
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateWorkOrderDto) {
    const user = getUser(req);
    return this.workOrderService.create(user.tenantId, user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getUser(req);
    return this.workOrderService.findAll(
      user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.workOrderService.findOne(user.tenantId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    const user = getUser(req);
    return this.workOrderService.update(user.tenantId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const user = getUser(req);
    return this.workOrderService.updateStatus(
      user.tenantId,
      id,
      dto.status,
      user.sub,
    );
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id/assign')
  async assign(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: AssignTechDto,
  ) {
    const user = getUser(req);
    return this.workOrderService.assign(user.tenantId, id, dto.technicianId);
  }
}

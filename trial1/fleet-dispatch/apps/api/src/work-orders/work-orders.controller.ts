import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Header,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { PaginationParams, PaginationInput } from '../common/decorators/pagination-params.decorator';

// TRACED:FD-API-002 — Work orders controller with CRUD + status transitions
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  async create(@CompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async findAll(@CompanyId() companyId: string, @PaginationParams() paging: PaginationInput) {
    return this.workOrdersService.findAll(companyId, paging.page, paging.pageSize);
  }

  @Get(':id')
  async findOne(@CompanyId() companyId: string, @Param('id') orderId: string) {
    return this.workOrdersService.findOne(companyId, orderId);
  }

  @Patch(':id')
  async update(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@CompanyId() companyId: string, @Param('id') id: string, @Body('status') status: WorkOrderStatus) {
    return this.workOrdersService.updateStatus(companyId, id, status);
  }

  @Delete(':id')
  async delete(@CompanyId() companyId: string, @Param('id') orderId: string) {
    return this.workOrdersService.delete(companyId, orderId);
  }
}

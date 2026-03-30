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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

/**
 * Customer controller — CRUD operations.
 * TRACED:FD-CUST-002
 */
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customerService.create(req.user.companyId, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.customerService.findAll(req.user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.customerService.findOne(req.user.companyId, id);
  }

  @Get(':id/work-orders')
  async getWorkOrders(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    const customer = await this.customerService.findOne(req.user.companyId, id);
    return customer.workOrders;
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(req.user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.customerService.remove(req.user.companyId, id);
  }
}

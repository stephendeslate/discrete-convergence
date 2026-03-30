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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Customer management endpoints.
 * TRACED: FD-CUST-002
 */
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    const user = getUser(req);
    return this.customerService.create(user.tenantId, user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getUser(req);
    return this.customerService.findAll(
      user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.customerService.findOne(user.tenantId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    const user = getUser(req);
    return this.customerService.update(user.tenantId, id, dto);
  }

  @Get(':id/work-orders')
  async getWorkOrders(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.customerService.getWorkOrders(user.tenantId, id);
  }
}

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    const user = req.user as { companyId: string };
    return this.customerService.create(user.companyId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query: PaginatedQueryDto) {
    const user = req.user as { companyId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.customerService.findAll(user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.customerService.findOne(user.companyId, id);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const user = req.user as { companyId: string };
    return this.customerService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.customerService.remove(user.companyId, id);
  }
}

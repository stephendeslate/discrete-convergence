import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

// TRACED:FD-CUST-002
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    const user = req.user as AuthenticatedUser;
    return this.customerService.create(user.companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.customerService.findAll(
      user.companyId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.customerService.findOne(user.companyId, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.customerService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.customerService.remove(user.companyId, id);
  }
}

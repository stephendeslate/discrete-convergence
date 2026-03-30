import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customerService.create(req.user.companyId, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.customerService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.customerService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Delete(':id')
  remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.customerService.remove(req.user.companyId, id);
  }
}

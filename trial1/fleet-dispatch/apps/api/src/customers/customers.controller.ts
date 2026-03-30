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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { PaginationParams, PaginationInput } from '../common/decorators/pagination-params.decorator';

// TRACED:FD-API-001 — RESTful controller with standard HTTP methods (GET, POST, PATCH, DELETE)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@CompanyId() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(@CompanyId() companyId: string, @PaginationParams() params: PaginationInput) {
    return this.customersService.findAll(companyId, params.page, params.pageSize);
  }

  @Get(':id')
  async findOne(@CompanyId() companyId: string, @Param('id') customerId: string) {
    return this.customersService.findOne(companyId, customerId);
  }

  @Patch(':id')
  async update(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(companyId, id, dto);
  }

  @Delete(':id')
  async delete(@CompanyId() companyId: string, @Param('id') customerId: string) {
    return this.customersService.delete(companyId, customerId);
  }
}

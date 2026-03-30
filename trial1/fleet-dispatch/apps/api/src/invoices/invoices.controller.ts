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
import { InvoiceStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { PaginationParams, PaginationInput } from '../common/decorators/pagination-params.decorator';

// TRACED:FD-API-005 — Invoices controller with CRUD + status transitions
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@CompanyId() companyId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(@CompanyId() companyId: string, @PaginationParams() invoicePaging: PaginationInput) {
    return this.invoicesService.findAll(companyId, invoicePaging.page, invoicePaging.pageSize);
  }

  @Get(':id')
  async findOne(@CompanyId() companyId: string, @Param('id') invoiceId: string) {
    return this.invoicesService.findOne(companyId, invoiceId);
  }

  @Patch(':id/status')
  async updateStatus(@CompanyId() companyId: string, @Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.invoicesService.updateStatus(companyId, id, status);
  }

  @Delete(':id')
  async delete(@CompanyId() companyId: string, @Param('id') invoiceId: string) {
    return this.invoicesService.delete(companyId, invoiceId);
  }
}

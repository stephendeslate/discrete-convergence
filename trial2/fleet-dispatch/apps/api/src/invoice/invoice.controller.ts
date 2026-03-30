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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

/**
 * Invoice controller — create, list, send, delete.
 * TRACED:FD-INV-003
 */
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('work-orders/:workOrderId')
  async create(
    @Request() req: { user: { companyId: string } },
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(req.user.companyId, workOrderId, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.invoiceService.findAll(req.user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.invoiceService.findOne(req.user.companyId, id);
  }

  @Patch(':id/send')
  async send(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.invoiceService.send(req.user.companyId, id);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.invoiceService.remove(req.user.companyId, id);
  }
}

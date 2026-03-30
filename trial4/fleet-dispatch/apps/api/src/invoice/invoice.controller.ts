import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('work-orders/:workOrderId')
  async create(@Req() req: Request, @Param('workOrderId') workOrderId: string, @Body() dto: CreateInvoiceDto) {
    const user = req.user as { companyId: string };
    return this.invoiceService.create(user.companyId, workOrderId, dto);
  }

  @Get()
  async findAll(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query: PaginatedQueryDto) {
    const user = req.user as { companyId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.invoiceService.findAll(user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.invoiceService.findOne(user.companyId, id);
  }

  @Patch(':id/status')
  async updateStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    const user = req.user as { companyId: string };
    return this.invoiceService.updateStatus(user.companyId, id, dto.status);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.invoiceService.remove(user.companyId, id);
  }
}

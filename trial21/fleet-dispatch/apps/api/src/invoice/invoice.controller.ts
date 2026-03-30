import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Invoice management endpoints.
 * TRACED: FD-INV-003
 */
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post('work-orders/:workOrderId')
  async create(
    @Req() req: Request,
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    const user = getUser(req);
    return this.invoiceService.createFromWorkOrder(
      user.tenantId,
      user.companyId,
      workOrderId,
      dto,
    );
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id/send')
  async send(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.invoiceService.send(user.tenantId, id);
  }

  @Roles('ADMIN')
  @Patch(':id/pay')
  async markPaid(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.invoiceService.markPaid(user.tenantId, id);
  }

  @Roles('ADMIN')
  @Patch(':id/void')
  async void(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.invoiceService.void(user.tenantId, id);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getUser(req);
    return this.invoiceService.findAll(
      user.tenantId,
      query.page,
      query.limit,
    );
  }
}

import { Controller, Post, Patch, Get, Param, Query, Request } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('work-order/:workOrderId')
  createFromWorkOrder(
    @Param('workOrderId') workOrderId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.invoiceService.createFromWorkOrder(workOrderId, req.user.companyId);
  }

  @Patch(':id/send')
  send(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invoiceService.send(id, req.user.companyId);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoiceService.findAll(req.user.companyId, Number(page), Number(limit));
  }
}

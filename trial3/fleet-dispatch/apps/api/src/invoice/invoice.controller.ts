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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

// TRACED:FD-INV-003
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateInvoiceDto) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.create(user.companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.findAll(
      user.companyId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.findOne(user.companyId, id);
  }

  @Patch(':id/send')
  send(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.updateStatus(user.companyId, id, 'SENT');
  }

  @Patch(':id/pay')
  pay(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.updateStatus(user.companyId, id, 'PAID');
  }

  @Patch(':id/void')
  void_(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.updateStatus(user.companyId, id, 'VOID');
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.invoiceService.remove(user.companyId, id);
  }
}

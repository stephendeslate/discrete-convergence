// TRACED:FD-INV-001
// TRACED:FD-INV-002
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPage, clampLimit, paginationMeta } from 'shared';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromWorkOrder(workOrderId: string, companyId: string) {
    // findFirst justified: work order lookup with company scope for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: { lineItems: true, invoice: true },
    });

    if (!workOrder) throw new NotFoundException('Work order not found');
    if (workOrder.status !== 'COMPLETED') {
      throw new BadRequestException('Work order must be COMPLETED to invoice');
    }
    if (workOrder.invoice) {
      throw new BadRequestException('Work order already has an invoice');
    }

    const subtotal = workOrder.lineItems.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const count = await this.prisma.invoice.count({ where: { companyId } });

    const invoice = await this.prisma.invoice.create({
      data: {
        sequenceNumber: count + 1,
        workOrderId,
        companyId,
        subtotal: new Decimal(subtotal.toFixed(2)),
        tax: new Decimal(tax.toFixed(2)),
        total: new Decimal(total.toFixed(2)),
      },
    });

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'INVOICED' },
    });

    return invoice;
  }

  async send(invoiceId: string, companyId: string) {
    // findFirst justified: invoice lookup with company scope
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { workOrder: { include: { customer: true } } },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { clampPagination } from '@fleet-dispatch/shared';

/**
 * Valid invoice status transitions.
 * TRACED:FD-INV-001
 */
const VALID_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: [InvoiceStatus.SENT, InvoiceStatus.VOID],
  SENT: [InvoiceStatus.PAID, InvoiceStatus.VOID],
  PAID: [],
  VOID: [],
};

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, workOrderId: string, dto: CreateInvoiceDto) {
    // findFirst: looking up work order by id + companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const invoiceCount = await this.prisma.invoice.count({ where: { companyId } });
    const invoiceNo = `INV-${String(invoiceCount + 1).padStart(5, '0')}`;

    const lineItemsData = dto.lineItems.map((item) => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = lineItemsData.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return this.prisma.invoice.create({
      data: {
        companyId,
        workOrderId,
        invoiceNo,
        subtotal,
        tax,
        total,
        lineItems: {
          create: lineItemsData,
        },
      },
      include: { lineItems: true, workOrder: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: validPage, take, skip } = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { lineItems: true, workOrder: { include: { customer: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
    ]);

    return {
      data,
      meta: { page: validPage, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: filtering by companyId + id for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { lineItems: true, workOrder: { include: { customer: true } } },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Send an invoice — transitions from DRAFT to SENT.
   * TRACED:FD-INV-002
   */
  async send(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);

    const allowed = VALID_INVOICE_TRANSITIONS[invoice.status];
    if (!allowed.includes(InvoiceStatus.SENT)) {
      throw new BadRequestException(
        `Cannot send invoice in ${invoice.status} status`,
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT, issuedAt: new Date() },
      include: { lineItems: true, workOrder: true },
    });
  }

  async remove(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be deleted');
    }

    return this.prisma.invoice.delete({ where: { id } });
  }
}

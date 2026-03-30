import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import { buildPaginatedResult } from '../common/pagination.utils';
import pino from 'pino';

const logger = pino({ name: 'invoice-service' });

/**
 * Invoice lifecycle management with immutability after SENT.
 * TRACED: FD-INV-001
 */
@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromWorkOrder(
    tenantId: string,
    companyId: string,
    workOrderId: string,
    dto: CreateInvoiceDto,
  ) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }
    if (wo.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Work order must be COMPLETED to create invoice',
      );
    }

    const existing = await this.prisma.invoice.findUnique({
      where: { workOrderId },
    });
    if (existing) {
      // TRACED: FD-EDGE-003 — duplicate invoice creation returns 400
      throw new BadRequestException(
        'Invoice already exists for this work order',
      );
    }

    const seqResult = await this.prisma.company.update({
      where: { id: companyId },
      data: { invSequence: { increment: 1 } },
      select: { invSequence: true },
    });

    const sequenceNumber = `INV-${String(seqResult.invSequence).padStart(5, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    const lineItemsData = dto.lineItems.map((item) => {
      const total = Number(item.quantity) * Number(item.unitPrice);
      if (item.type === 'TAX') {
        taxAmount += total;
      } else if (item.type === 'DISCOUNT') {
        subtotal -= Math.abs(total);
      } else {
        subtotal += total;
      }
      return {
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
      };
    });

    const invoice = await this.prisma.invoice.create({
      data: {
        sequenceNumber,
        workOrderId,
        companyId,
        tenantId,
        subtotal,
        tax: taxAmount,
        total: subtotal + taxAmount,
        lineItems: { create: lineItemsData },
      },
      include: { lineItems: true },
    });

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'INVOICED' },
    });

    logger.info({ invoiceId: invoice.id, sequenceNumber }, 'Invoice created');
    return invoice;
  }

  async send(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async markPaid(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status !== 'SENT') {
      throw new BadRequestException('Only SENT invoices can be marked as paid');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      }),
      this.prisma.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: 'PAID' },
      }),
    ]);

    return updated;
  }

  async void(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status === 'PAID') {
      // TRACED: FD-EDGE-004 — invoice void after payment returns 400
      // TRACED: FD-EDGE-007 — invoice state machine violations logged
      throw new BadRequestException('Cannot void a paid invoice');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'VOID' },
    });
  }

  async findAll(tenantId: string, page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { lineItems: true },
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  /**
   * Checks immutability constraint: invoices after SENT cannot be modified.
   * TRACED: FD-INV-002
   */
  isImmutable(status: InvoiceStatus): boolean {
    return status === 'SENT' || status === 'PAID';
  }
}

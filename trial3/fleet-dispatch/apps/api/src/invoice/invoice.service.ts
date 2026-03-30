import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma, LineItemType, InvoiceStatus } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';

const VALID_INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'VOID'],
  SENT: ['PAID', 'VOID'],
  PAID: [],
  VOID: [],
};

// TRACED:FD-INV-001
@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const lineItemsData = dto.lineItems.map((item) => {
        const total = item.quantity * item.unitPrice;
        return {
          type: item.type as LineItemType,
          description: item.description,
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          total: new Prisma.Decimal(total),
        };
      });

      const totalAmount = lineItemsData.reduce(
        (sum, item) => sum.add(item.total),
        new Prisma.Decimal(0),
      );

      const invoice = await tx.invoice.create({
        data: {
          companyId,
          workOrderId: dto.workOrderId,
          totalAmount,
          lineItems: {
            create: lineItemsData,
          },
        },
        include: { lineItems: true, workOrder: true },
      });

      return invoice;
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { lineItems: true, workOrder: true },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true, workOrder: true },
    });
    if (!invoice || invoice.companyId !== companyId) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  // TRACED:FD-INV-002
  async updateStatus(companyId: string, id: string, status: string) {
    const invoice = await this.findOne(companyId, id);
    const validNextStatuses = VALID_INVOICE_TRANSITIONS[invoice.status];

    if (!validNextStatuses || !validNextStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition invoice from ${invoice.status} to ${status}`,
      );
    }

    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: status as InvoiceStatus,
        issuedAt: status === 'SENT' ? new Date() : undefined,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
      include: { lineItems: true, workOrder: true },
    });
  }

  async remove(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft invoices');
    }
    await this.prisma.lineItem.deleteMany({ where: { invoiceId: invoice.id } });
    return this.prisma.invoice.delete({ where: { id: invoice.id } });
  }
}

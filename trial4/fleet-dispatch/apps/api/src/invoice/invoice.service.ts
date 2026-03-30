// TRACED:FD-DAT-004 — InvoiceService with status machine and Decimal amounts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

const VALID_INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'VOID'],
  SENT: ['PAID', 'VOID'],
  PAID: [],
  VOID: [],
};

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, workOrderId: string, dto: CreateInvoiceDto) {
    const totalAmount = dto.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.invoice.create({
      data: {
        workOrderId,
        companyId,
        totalAmount: new Prisma.Decimal(totalAmount),
        lineItems: {
          create: dto.lineItems.map((item) => ({
            type: item.type,
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            amount: new Prisma.Decimal(item.quantity * item.unitPrice),
          })),
        },
      },
      include: { lineItems: true, workOrder: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { lineItems: true, workOrder: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: scoped by companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { lineItems: true, workOrder: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async updateStatus(companyId: string, id: string, newStatus: InvoiceStatus) {
    const invoice = await this.findOne(companyId, id);
    const allowed = VALID_INVOICE_TRANSITIONS[invoice.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid invoice status transition from ${invoice.status} to ${newStatus}`,
      );
    }
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus,
        sentAt: newStatus === 'SENT' ? new Date() : undefined,
        paidAt: newStatus === 'PAID' ? new Date() : undefined,
      },
      include: { lineItems: true, workOrder: true },
    });
  }

  async remove(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be deleted');
    }
    await this.prisma.lineItem.deleteMany({ where: { invoiceId: id } });
    return this.prisma.invoice.delete({ where: { id } });
  }
}

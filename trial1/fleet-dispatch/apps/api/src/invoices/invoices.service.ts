import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

// TRACED:FD-DM-003 — Invoice state machine: DRAFT→SENT→PAID, VOID from DRAFT/SENT
const VALID_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: [InvoiceStatus.SENT, InvoiceStatus.VOID],
  SENT: [InvoiceStatus.PAID, InvoiceStatus.VOID],
  PAID: [],
  VOID: [],
};

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED:FD-DM-004 — Decimal(12,2) monetary fields via Prisma.Decimal
  async create(companyId: string, dto: CreateInvoiceDto) {
    const subtotal = new Prisma.Decimal(dto.subtotal);
    const tax = new Prisma.Decimal(dto.tax ?? '0');
    const totalAmount = subtotal.add(tax);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          subtotal,
          tax,
          totalAmount,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          workOrderId: dto.workOrderId,
          customerId: dto.customerId,
          companyId,
        },
        include: { lineItems: true, customer: true },
      });

      if (dto.lineItems?.length) {
        await tx.lineItem.createMany({
          data: dto.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.unitPrice).mul(item.quantity ?? 1),
            invoiceId: invoice.id,
          })),
        });
      }

      return tx.invoice.findUnique({
        where: { id: invoice.id },
        include: { lineItems: true, customer: true },
      });
    });
  }

  async findAll(companyId: string, page?: number, invoicePageSize?: number) {
    const { pageSize: batchSize, skip: invoiceOffset } = clampPagination(page, invoicePageSize);
    const [invoices, invoiceCount] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { companyId },
        include: { lineItems: true, customer: true },
        skip: invoiceOffset,
        take: batchSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { companyId } }),
    ]);
    return { data: invoices, total: invoiceCount, page: page ?? 1, pageSize: batchSize };
  }

  async findOne(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lineItems: true, customer: true, order: true },
    });

    if (!invoice || invoice.companyId !== companyId) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateStatus(companyId: string, id: string, newStatus: InvoiceStatus) {
    const invoiceToTransition = await this.findOne(companyId, id);
    const validNext = VALID_INVOICE_TRANSITIONS[invoiceToTransition.status];

    if (!validNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid invoice status transition from ${invoiceToTransition.status} to ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      return tx.invoice.update({
        where: { id: invoiceToTransition.id },
        data: {
          status: newStatus,
          sentAt: newStatus === InvoiceStatus.SENT ? new Date() : undefined,
          paidAt: newStatus === InvoiceStatus.PAID ? new Date() : undefined,
        },
        include: { lineItems: true, customer: true },
      });
    });
  }

  async delete(companyId: string, invoiceId: string) {
    const invoiceToDelete = await this.findOne(companyId, invoiceId);

    if (invoiceToDelete.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.lineItem.deleteMany({ where: { invoiceId: invoiceToDelete.id } });
      await tx.invoice.delete({ where: { id: invoiceToDelete.id } });
    });

    return { deleted: true };
  }
}

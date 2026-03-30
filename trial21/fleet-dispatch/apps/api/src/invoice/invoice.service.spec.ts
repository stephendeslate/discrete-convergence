import { InvoiceService } from './invoice.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import {
  createTestInvoice,
  createTestWorkOrder,
  TENANT_ID,
  COMPANY_ID,
} from '../../test/helpers/factories';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new InvoiceService(prisma as never);
  });

  describe('createFromWorkOrder', () => {
    it('should create invoice for completed work order', async () => {
      const wo = createTestWorkOrder({ status: 'COMPLETED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.invoice.findUnique.mockResolvedValue(null);
      prisma.company.update.mockResolvedValue({ invSequence: 1 });
      const invoice = createTestInvoice({ workOrderId: wo.id });
      prisma.invoice.create.mockResolvedValue({
        ...invoice,
        lineItems: [],
      });
      prisma.workOrder.update.mockResolvedValue(wo);

      const result = await service.createFromWorkOrder(
        TENANT_ID,
        COMPANY_ID,
        wo.id,
        {
          lineItems: [
            {
              type: 'LABOR' as never,
              description: 'Service call',
              quantity: 1,
              unitPrice: 100,
            },
          ],
        },
      );

      expect(result.sequenceNumber).toBeDefined();
    });

    it('should reject invoice for non-completed work order', async () => {
      const wo = createTestWorkOrder({ status: 'ASSIGNED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.createFromWorkOrder(TENANT_ID, COMPANY_ID, wo.id, {
          lineItems: [],
        }),
      ).rejects.toThrow('Work order must be COMPLETED');
    });

    it('should reject duplicate invoice', async () => {
      const wo = createTestWorkOrder({ status: 'COMPLETED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.invoice.findUnique.mockResolvedValue(createTestInvoice());

      await expect(
        service.createFromWorkOrder(TENANT_ID, COMPANY_ID, wo.id, {
          lineItems: [],
        }),
      ).rejects.toThrow('Invoice already exists');
    });
  });

  describe('send', () => {
    it('should send a draft invoice', async () => {
      const invoice = createTestInvoice({ status: 'DRAFT' });
      prisma.invoice.findUnique.mockResolvedValue(invoice);
      prisma.invoice.update.mockResolvedValue({
        ...invoice,
        status: 'SENT',
      });

      const result = await service.send(TENANT_ID, invoice.id);
      expect(result.status).toBe('SENT');
    });

    it('should reject sending non-draft invoice', async () => {
      const invoice = createTestInvoice({ status: 'SENT' });
      prisma.invoice.findUnique.mockResolvedValue(invoice);

      await expect(
        service.send(TENANT_ID, invoice.id),
      ).rejects.toThrow('Only DRAFT invoices can be sent');
    });
  });

  describe('void', () => {
    it('should void a draft invoice', async () => {
      const invoice = createTestInvoice({ status: 'DRAFT' });
      prisma.invoice.findUnique.mockResolvedValue(invoice);
      prisma.invoice.update.mockResolvedValue({
        ...invoice,
        status: 'VOID',
      });

      const result = await service.void(TENANT_ID, invoice.id);
      expect(result.status).toBe('VOID');
    });

    it('should reject voiding a paid invoice', async () => {
      const invoice = createTestInvoice({ status: 'PAID' });
      prisma.invoice.findUnique.mockResolvedValue(invoice);

      await expect(
        service.void(TENANT_ID, invoice.id),
      ).rejects.toThrow('Cannot void a paid invoice');
    });
  });

  describe('isImmutable', () => {
    it('should return true for SENT status', () => {
      expect(service.isImmutable('SENT' as never)).toBe(true);
    });

    it('should return true for PAID status', () => {
      expect(service.isImmutable('PAID' as never)).toBe(true);
    });

    it('should return false for DRAFT status', () => {
      expect(service.isImmutable('DRAFT' as never)).toBe(false);
    });
  });
});

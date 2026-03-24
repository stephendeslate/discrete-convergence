// TRACED:FD-TEST-009
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService } from './invoice.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  workOrder: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  invoice: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService(mockPrisma as never);
  });

  describe('createFromWorkOrder', () => {
    it('creates invoice from completed work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'COMPLETED', companyId: 'c1',
        lineItems: [{ total: 100 }, { total: 50 }],
        invoice: null,
      });
      mockPrisma.invoice.count.mockResolvedValue(3);
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1', sequenceNumber: 4 });
      mockPrisma.workOrder.update.mockResolvedValue({});

      const result = await service.createFromWorkOrder('wo1', 'c1');
      expect(result.sequenceNumber).toBe(4);
    });

    it('rejects non-completed work orders', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'ASSIGNED', lineItems: [], invoice: null,
      });

      await expect(service.createFromWorkOrder('wo1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate invoices', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'COMPLETED', lineItems: [],
        invoice: { id: 'inv1' },
      });

      await expect(service.createFromWorkOrder('wo1', 'c1')).rejects.toThrow(BadRequestException);
    });

    it('throws not found for missing work order', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.createFromWorkOrder('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('send', () => {
    it('sends draft invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'DRAFT' });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv1', status: 'SENT' });

      const result = await service.send('inv1', 'c1');
      expect(result.status).toBe('SENT');
    });

    it('rejects sending non-draft invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'SENT' });

      await expect(service.send('inv1', 'c1')).rejects.toThrow(BadRequestException);
    });
  });
});

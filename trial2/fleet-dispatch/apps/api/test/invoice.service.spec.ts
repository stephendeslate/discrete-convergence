import { InvoiceService } from '../src/invoice/invoice.service';
import { PrismaService } from '../src/common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Unit tests for InvoiceService with mocked Prisma.
 * TRACED:FD-INV-004
 */
describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    workOrder: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      invoice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      workOrder: {
        findFirst: jest.fn(),
      },
    };

    service = new InvoiceService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create an invoice for a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', companyId: 'c-1' });
      prisma.invoice.count.mockResolvedValue(0);
      const expected = { id: 'inv-1', invoiceNo: 'INV-00001' };
      prisma.invoice.create.mockResolvedValue(expected);

      const result = await service.create('c-1', 'wo-1', {
        lineItems: [
          { type: 'LABOR', description: 'Labor', quantity: 2, unitPrice: 100 },
        ],
      });

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException for invalid work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create('c-1', 'nonexistent', {
          lineItems: [
            { type: 'LABOR', description: 'Labor', quantity: 1, unitPrice: 50 },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return an invoice by id and companyId', async () => {
      const expected = { id: 'inv-1', companyId: 'c-1', status: 'DRAFT' };
      prisma.invoice.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('c-1', 'inv-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('c-1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('send', () => {
    it('should transition invoice from DRAFT to SENT', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        companyId: 'c-1',
        status: 'DRAFT',
      });
      const updated = { id: 'inv-1', status: 'SENT' };
      prisma.invoice.update.mockResolvedValue(updated);

      const result = await service.send('c-1', 'inv-1');
      expect(result).toEqual(updated);
    });

    it('should reject sending a PAID invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        companyId: 'c-1',
        status: 'PAID',
      });

      await expect(service.send('c-1', 'inv-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a DRAFT invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        companyId: 'c-1',
        status: 'DRAFT',
      });
      prisma.invoice.delete.mockResolvedValue({ id: 'inv-1' });

      const result = await service.remove('c-1', 'inv-1');
      expect(result).toEqual({ id: 'inv-1' });
    });

    it('should reject deleting a SENT invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        companyId: 'c-1',
        status: 'SENT',
      });

      await expect(service.remove('c-1', 'inv-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      prisma.invoice.count.mockResolvedValue(1);

      const result = await service.findAll('c-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});

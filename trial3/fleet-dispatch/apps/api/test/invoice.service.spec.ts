import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from '../src/invoice/invoice.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    lineItem: { deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      lineItem: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.findOne('c1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return invoice if found in same company', async () => {
      const mockInvoice = {
        id: '1',
        companyId: 'c1',
        status: 'DRAFT',
        totalAmount: 100,
      };
      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);

      const result = await service.findOne('c1', '1');
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException for invalid transition', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'PAID',
      });

      await expect(
        service.updateStatus('c1', '1', 'VOID'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow DRAFT to SENT transition', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'DRAFT',
      });

      const updatedInvoice = {
        id: '1',
        companyId: 'c1',
        status: 'SENT',
      };
      prisma.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await service.updateStatus('c1', '1', 'SENT');
      expect(result.status).toBe('SENT');
    });

    it('should allow DRAFT to VOID transition', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'DRAFT',
      });

      prisma.invoice.update.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'VOID',
      });

      const result = await service.updateStatus('c1', '1', 'VOID');
      expect(result.status).toBe('VOID');
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException for non-draft invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'SENT',
      });

      await expect(service.remove('c1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

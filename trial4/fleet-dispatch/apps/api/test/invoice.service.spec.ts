import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from '../src/invoice/invoice.service';
import { PrismaService } from '../src/common/prisma.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock; count: jest.Mock };
    lineItem: { deleteMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      lineItem: { deleteMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when invoice not found', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);
    await expect(service.findOne('c1', 'nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid invoice status transitions', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      status: 'PAID',
      companyId: 'c1',
    });
    await expect(service.updateStatus('c1', 'inv-1', 'DRAFT')).rejects.toThrow(BadRequestException);
  });

  it('should reject deletion of non-draft invoices', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      status: 'SENT',
      companyId: 'c1',
    });
    await expect(service.remove('c1', 'inv-1')).rejects.toThrow(BadRequestException);
  });

  it('should return paginated results', async () => {
    const result = await service.findAll('c1', 1, 20);
    expect(result.page).toBe(1);
    expect(result.total).toBe(0);
  });
});

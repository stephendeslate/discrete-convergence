import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../infra/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    setTenantContext: jest.Mock;
  };

  const companyId = 'comp-1';

  beforeEach(async () => {
    prisma = {
      customer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should create a customer', async () => {
    prisma.customer.create.mockResolvedValue({
      id: 'cust-1',
      name: 'Acme Corp',
      email: 'acme@example.com',
      companyId,
    });

    const result = await service.create(companyId, {
      name: 'Acme Corp',
      email: 'acme@example.com',
    });

    expect(result.name).toBe('Acme Corp');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should return paginated customers', async () => {
    prisma.customer.findMany.mockResolvedValue([{ id: 'cust-1' }]);
    prisma.customer.count.mockResolvedValue(1);

    const result = await service.findAll(companyId, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw 404 for non-existent customer', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});

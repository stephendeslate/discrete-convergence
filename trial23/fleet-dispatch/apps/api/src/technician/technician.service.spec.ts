import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../infra/prisma.service';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technician: {
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
      technician: {
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
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  it('should create a technician', async () => {
    prisma.technician.create.mockResolvedValue({
      id: 'tech-1',
      name: 'John Doe',
      email: 'john@example.com',
      companyId,
    });

    const result = await service.create(companyId, {
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(result.name).toBe('John Doe');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should return paginated technicians', async () => {
    prisma.technician.findMany.mockResolvedValue([{ id: 'tech-1' }]);
    prisma.technician.count.mockResolvedValue(1);

    const result = await service.findAll(companyId, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw 404 for non-existent technician', async () => {
    prisma.technician.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});

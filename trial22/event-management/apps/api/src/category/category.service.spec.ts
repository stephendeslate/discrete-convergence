import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  category: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  it('should return paginated categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([{ id: '1', name: 'Tech' }]);
    mockPrisma.category.count.mockResolvedValue(1);
    const result = await service.findAll('t1', {});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create category with tenant', async () => {
    const dto = { name: 'Tech', slug: 'tech' };
    mockPrisma.category.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: { ...dto, tenantId: 't1' } });
  });
});

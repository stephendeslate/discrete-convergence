import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from '../src/category/category.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockPrisma = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: 'c-1', name: 'Music' },
      ]);
      mockPrisma.category.count.mockResolvedValue(1);
      const result = await service.findAll('tenant-1', '1', '10');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      mockPrisma.category.create.mockResolvedValue({
        id: 'c-1',
        name: 'Music',
        tenantId: 'tenant-1',
      });
      const result = await service.create(
        { name: 'Music', description: 'Live music events' },
        'tenant-1',
      );
      expect(result.name).toBe('Music');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;

  const mockDataSource = {
    id: 'ds-1',
    name: 'Test DB',
    type: 'POSTGRES',
    config: { host: 'localhost', port: 5432 },
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    dataSource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should store config as JSON and set tenant from parameter', async () => {
      const config = { host: 'db.example.com', port: 5432 };
      mockPrisma.dataSource.create.mockResolvedValue({ ...mockDataSource, config });

      await service.create('tenant-1', { name: 'DB', type: 'POSTGRES', config });

      const createCall = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createCall.data.config).toEqual(config);
      expect(createCall.data.tenantId).toBe('tenant-1');
    });

    it('should default config to empty object when not provided', async () => {
      mockPrisma.dataSource.create.mockResolvedValue(mockDataSource);

      await service.create('tenant-1', { name: 'CSV Source', type: 'CSV' });

      const createCall = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createCall.data.config).toEqual({});
    });
  });

  describe('findOne', () => {
    it('should include sync runs in the response', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        ...mockDataSource,
        syncRuns: [{ id: 'sr-1', status: 'COMPLETED', rowsIngested: 1500 }],
      });

      const result = await service.findOne('tenant-1', 'ds-1');

      const findCall = mockPrisma.dataSource.findUnique.mock.calls[0][0];
      expect(findCall.include.syncRuns).toBeDefined();
      expect(findCall.include.syncRuns.take).toBe(10);
      // Verify the result contains sync runs (actual data, not just passthrough)
      expect((result as unknown as { syncRuns: unknown[] }).syncRuns).toHaveLength(1);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        ...mockDataSource,
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('tenant-1', 'ds-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should compute pagination metadata from total count', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([mockDataSource]);
      mockPrisma.dataSource.count.mockResolvedValue(50);

      const result = await service.findAll('tenant-1', 2, 10);

      expect(result.meta.totalPages).toBe(5); // ceil(50/10)
      expect(result.meta.page).toBe(2);
    });
  });

  describe('update', () => {
    it('should only update fields that are explicitly provided', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockDataSource);
      mockPrisma.dataSource.update.mockResolvedValue({ ...mockDataSource, name: 'Updated DB' });

      await service.update('tenant-1', 'ds-1', { name: 'Updated DB' });

      const updateCall = mockPrisma.dataSource.update.mock.calls[0][0];
      expect(updateCall.data).toHaveProperty('name');
      expect(updateCall.data).not.toHaveProperty('type');
      expect(updateCall.data).not.toHaveProperty('config');
    });
  });
});

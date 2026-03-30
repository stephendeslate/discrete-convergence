// TRACED:AE-DS-002 — Negative and edge case tests for data source CRUD
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { createMockPrismaService, createTestDataSource, TEST_TENANT_ID } from './helpers/setup';

describe('DataSourceService — negative and edge cases', () => {
  let service: DataSourceService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new DataSourceService(mockPrisma as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create — edge cases', () => {
    it('should handle all data source type values', async () => {
      const types = ['POSTGRES', 'MYSQL', 'REST_API', 'CSV'];

      for (const type of types) {
        mockPrisma.dataSource.create.mockResolvedValue(
          createTestDataSource({ type }),
        );

        const result = await service.create(TEST_TENANT_ID, {
          name: `${type} Source`,
          type,
        });

        expect(result.type).toBe(type);
      }
    });

    it('should preserve nested config objects', async () => {
      const config = {
        connection: { host: 'db.example.com', port: 5432, ssl: true },
        auth: { username: 'reader', method: 'password' },
      };

      mockPrisma.dataSource.create.mockResolvedValue(
        createTestDataSource({ config }),
      );

      await service.create(TEST_TENANT_ID, {
        name: 'Complex DB',
        type: 'POSTGRES',
        config,
      });

      const createArg = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createArg.data.config).toEqual(config);
    });

    it('should default config to empty object when undefined', async () => {
      mockPrisma.dataSource.create.mockResolvedValue(
        createTestDataSource({ config: {} }),
      );

      await service.create(TEST_TENANT_ID, { name: 'Simple', type: 'CSV' });

      const createArg = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createArg.data.config).toEqual({});
    });
  });

  describe('findOne — negative cases', () => {
    it('should throw NotFoundException for non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'ds-404'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException for cross-tenant access attempt', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(
        createTestDataSource({ tenantId: 'attacker-tenant' }),
      );

      await expect(service.findOne(TEST_TENANT_ID, 'ds-1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should include data source ID in error message', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'ds-xyz'))
        .rejects
        .toThrow('DataSource ds-xyz not found');
    });

    it('should request syncRuns with take 10 and desc ordering', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(
        createTestDataSource(),
      );

      await service.findOne(TEST_TENANT_ID, 'ds-1');

      const findArg = mockPrisma.dataSource.findUnique.mock.calls[0][0];
      expect(findArg.include.syncRuns.take).toBe(10);
      expect(findArg.include.syncRuns.orderBy.createdAt).toBe('desc');
    });
  });

  describe('findAll — edge cases', () => {
    it('should return empty results for tenant with no data sources', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      mockPrisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle boundary page calculation', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      mockPrisma.dataSource.count.mockResolvedValue(20);

      const result = await service.findAll(TEST_TENANT_ID, 1, 20);

      // Exactly 20/20 = 1 page
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('update — negative cases', () => {
    it('should throw NotFoundException when updating non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(
        service.update(TEST_TENANT_ID, 'ds-404', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.dataSource.update).not.toHaveBeenCalled();
    });

    it('should prevent cross-tenant update', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(
        createTestDataSource({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.update(TEST_TENANT_ID, 'ds-1', { name: 'Hijacked' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.dataSource.update).not.toHaveBeenCalled();
    });

    it('should handle partial update with only name', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(createTestDataSource());
      mockPrisma.dataSource.update.mockResolvedValue(
        createTestDataSource({ name: 'Renamed' }),
      );

      await service.update(TEST_TENANT_ID, 'ds-1', { name: 'Renamed' });

      const updateArg = mockPrisma.dataSource.update.mock.calls[0][0];
      expect(updateArg.data).toHaveProperty('name');
      expect(updateArg.data).not.toHaveProperty('type');
      expect(updateArg.data).not.toHaveProperty('config');
    });

    it('should handle partial update with only type', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(createTestDataSource());
      mockPrisma.dataSource.update.mockResolvedValue(
        createTestDataSource({ type: 'MYSQL' }),
      );

      await service.update(TEST_TENANT_ID, 'ds-1', { type: 'MYSQL' });

      const updateArg = mockPrisma.dataSource.update.mock.calls[0][0];
      expect(updateArg.data).toHaveProperty('type');
      expect(updateArg.data).not.toHaveProperty('name');
    });
  });

  describe('remove — negative cases', () => {
    it('should throw NotFoundException when deleting non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.remove(TEST_TENANT_ID, 'ds-404'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.dataSource.delete).not.toHaveBeenCalled();
    });

    it('should prevent cross-tenant deletion', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(
        createTestDataSource({ tenantId: 'victim-tenant' }),
      );

      await expect(service.remove(TEST_TENANT_ID, 'ds-1'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.dataSource.delete).not.toHaveBeenCalled();
    });
  });
});

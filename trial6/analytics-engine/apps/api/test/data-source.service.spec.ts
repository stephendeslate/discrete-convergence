import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { createMockPrismaService, createTestDataSource, TEST_TENANT_ID } from './helpers/setup';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new DataSourceService(mockPrisma as never);
  });

  describe('create', () => {
    it('should store config as JSON object and associate with tenant', async () => {
      const config = { host: 'db.example.com', port: 5432, ssl: true };
      const created = createTestDataSource({ config });
      mockPrisma.dataSource.create.mockResolvedValue(created);

      const result = await service.create(TEST_TENANT_ID, {
        name: 'Production DB',
        type: 'POSTGRES',
        config,
      });

      const createArg = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createArg.data.tenantId).toBe(TEST_TENANT_ID);
      expect(createArg.data.config).toEqual(config);
      // Verify config has the expected structure in the result
      expect(result.config).toHaveProperty('host', 'db.example.com');
    });

    it('should default config to empty object when not provided', async () => {
      mockPrisma.dataSource.create.mockResolvedValue(createTestDataSource({ config: {} }));

      await service.create(TEST_TENANT_ID, { name: 'CSV Source', type: 'CSV' });

      const createArg = mockPrisma.dataSource.create.mock.calls[0][0];
      expect(createArg.data.config).toEqual({});
    });
  });

  describe('findAll', () => {
    it('should compute pagination metadata correctly', async () => {
      const sources = Array.from({ length: 3 }, (_, i) =>
        createTestDataSource({ id: `ds-${i}` }),
      );
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);
      mockPrisma.dataSource.count.mockResolvedValue(15);

      const result = await service.findAll(TEST_TENANT_ID, 2, 3);

      // Page 2 of 3-per-page with 15 total = 5 pages
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should reject access when data source belongs to different tenant', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(
        createTestDataSource({ tenantId: 'other-tenant' }),
      );

      await expect(service.findOne(TEST_TENANT_ID, 'ds-1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should include syncRuns in the response', async () => {
      const dsWithRuns = {
        ...createTestDataSource(),
        syncRuns: [{ id: 'run-1', status: 'COMPLETED', rowsIngested: 1000 }],
      };
      mockPrisma.dataSource.findUnique.mockResolvedValue(dsWithRuns);

      const result = await service.findOne(TEST_TENANT_ID, 'ds-1');

      // Verify the include option was passed to findUnique
      const findArg = mockPrisma.dataSource.findUnique.mock.calls[0][0];
      expect(findArg.include).toHaveProperty('syncRuns');
      expect((result as Record<string, unknown>)['syncRuns']).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should allow partial updates with only provided fields', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(createTestDataSource());
      mockPrisma.dataSource.update.mockResolvedValue(
        createTestDataSource({ name: 'Renamed' }),
      );

      await service.update(TEST_TENANT_ID, 'ds-1', { name: 'Renamed' });

      const updateArg = mockPrisma.dataSource.update.mock.calls[0][0];
      expect(updateArg.data).toHaveProperty('name', 'Renamed');
      expect(updateArg.data).not.toHaveProperty('type');
      expect(updateArg.data).not.toHaveProperty('config');
    });
  });

  describe('remove', () => {
    it('should verify tenant ownership before deletion', async () => {
      mockPrisma.dataSource.findUnique
        .mockResolvedValueOnce(createTestDataSource()) // findOne check
        .mockResolvedValueOnce(createTestDataSource()); // not called again since findOne uses first
      mockPrisma.dataSource.delete.mockResolvedValue(createTestDataSource());

      await service.remove(TEST_TENANT_ID, 'ds-1');

      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalled();
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });
  });
});

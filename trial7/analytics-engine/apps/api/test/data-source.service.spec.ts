import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

// TRACED:AE-TEST-004
describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const mockDs = {
        id: 'ds-1',
        name: 'Test DB',
        type: 'POSTGRESQL',
        tenantId: 'tenant-1',
        widgets: [],
      };
      prisma.dataSource.create.mockResolvedValue(mockDs);

      const result = await service.create(
        { name: 'Test DB', type: 'POSTGRESQL', connectionUrl: 'postgres://...' },
        'tenant-1',
      );

      expect(result).toEqual(mockDs);
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      prisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle empty page parameter', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      prisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a data source by id', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
        widgets: [],
      });

      const result = await service.findOne('ds-1', 'tenant-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException for non-existent data source', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'other-tenant',
        widgets: [],
      });

      await expect(service.findOne('ds-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
        widgets: [],
      });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      await service.remove('ds-1', 'tenant-1');
      expect(prisma.dataSource.delete).toHaveBeenCalled();
    });
  });

  describe('getDataSourceStats', () => {
    it('should execute raw query for stats', async () => {
      prisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getDataSourceStats('tenant-1');
      expect(result).toEqual({ totalCount: 5 });
    });
  });
});

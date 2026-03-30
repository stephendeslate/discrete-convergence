import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId } from './helpers/test-utils';

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
    it('should create a data source with correct tenant', async () => {
      const mockDs = {
        id: 'ds-1',
        name: 'My DB',
        type: 'POSTGRESQL',
        connectionInfo: { host: 'localhost' },
        tenantId: mockTenantId,
        widgets: [],
      };
      prisma.dataSource.create.mockResolvedValue(mockDs);

      const result = await service.create(
        { name: 'My DB', type: 'POSTGRESQL', connectionInfo: { host: 'localhost' } },
        mockTenantId,
      );

      expect(result).toEqual(mockDs);
      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'My DB',
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources for tenant', async () => {
      const mockSources = [
        { id: 'ds-1', name: 'DB1', tenantId: mockTenantId, widgets: [] },
      ];
      prisma.dataSource.findMany.mockResolvedValue(mockSources);
      prisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(mockSources);
      expect(result.total).toBe(1);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });

    it('should apply pagination parameters correctly', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      prisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll(mockTenantId, 3, 5);

      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(5);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a data source by id', async () => {
      const mockDs = {
        id: 'ds-1',
        name: 'DB1',
        tenantId: mockTenantId,
        widgets: [],
      };
      prisma.dataSource.findUnique.mockResolvedValue(mockDs);

      const result = await service.findOne('ds-1', mockTenantId);

      expect(result).toEqual(mockDs);
      expect(prisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ds-1' },
        }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bad-id' },
        }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        name: 'DB1',
        tenantId: 'other-tenant',
        widgets: [],
      });

      await expect(service.findOne('ds-1', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dataSource.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        name: 'Old',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dataSource.update.mockResolvedValue({
        id: 'ds-1',
        name: 'New',
        tenantId: mockTenantId,
        widgets: [],
      });

      const result = await service.update('ds-1', { name: 'New' }, mockTenantId);

      expect(result.name).toBe('New');
      expect(prisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ds-1' },
          data: expect.objectContaining({ name: 'New' }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        name: 'DB1',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      await service.remove('ds-1', mockTenantId);

      expect(prisma.dataSource.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1' } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dataSource.delete).not.toHaveBeenCalled();
    });
  });
});

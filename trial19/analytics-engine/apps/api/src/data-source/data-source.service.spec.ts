import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dataSource: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DataSourceService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated data sources for tenant', async () => {
      const mockSources = [{ id: 'ds-1', name: 'Source 1', tenantId: 'tenant-1' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(mockSources);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', { page: 1, limit: 10 });

      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(mockSources);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenant', async () => {
      const mockSource = { id: 'ds-1', name: 'Test DB', tenantId: 'tenant-1', widgets: [] };
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockSource);

      const result = await service.findOne('ds-1', 'tenant-1');

      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1' } }),
      );
      expect(result).toEqual(mockSource);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1', tenantId: 'other-tenant', widgets: [],
      });

      await expect(service.findOne('ds-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a data source with tenant', async () => {
      const created = { id: 'ds-new', name: 'New DB', type: 'POSTGRESQL', tenantId: 'tenant-1' };
      mockPrisma.dataSource.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', { name: 'New DB', type: 'POSTGRESQL' });

      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'New DB', tenantId: 'tenant-1' }),
        }),
      );
      expect(result.id).toBe('ds-new');
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', widgets: [],
      });
      mockPrisma.dataSource.update.mockResolvedValue({
        id: 'ds-1', name: 'Updated', tenantId: 'tenant-1',
      });

      const result = await service.update('ds-1', 'tenant-1', { name: 'Updated' });

      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1' } }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', widgets: [],
      });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      await service.remove('ds-1', 'tenant-1');

      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});

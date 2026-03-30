import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';

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

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a data source with correct data', async () => {
      const mockDs = { id: 'ds-1', name: 'Test DB', type: 'POSTGRESQL', tenantId: 'tenant-1' };
      mockPrisma.dataSource.create.mockResolvedValue(mockDs);

      const result = await service.create(
        { name: 'Test DB', type: 'POSTGRESQL' },
        'tenant-1',
      );

      expect(result).toEqual(mockDs);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: {
          name: 'Test DB',
          type: 'POSTGRESQL',
          connectionString: undefined,
          config: '{}',
          tenantId: 'tenant-1',
        },
        include: { widgets: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources for tenant', async () => {
      const mockSources = [{ id: 'ds-1', name: 'DB1' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(mockSources);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(mockSources);
      expect(result.total).toBe(1);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenant', async () => {
      const mockDs = { id: 'ds-1', tenantId: 'tenant-1', name: 'DB1' };
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockDs);

      const result = await service.findOne('ds-1', 'tenant-1');

      expect(result).toEqual(mockDs);
      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        include: { widgets: true },
      });
    });

    it('should throw NotFoundException for non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { widgets: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('ds-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        include: { widgets: true },
      });
    });
  });

  describe('update', () => {
    it('should update a data source with correct data', async () => {
      const existing = { id: 'ds-1', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findUnique.mockResolvedValue(existing);
      mockPrisma.dataSource.update.mockResolvedValue({ ...existing, name: 'Updated' });

      const result = await service.update('ds-1', { name: 'Updated' }, 'tenant-1');

      expect(result.name).toBe('Updated');
      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { name: 'Updated' },
        include: { widgets: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      const existing = { id: 'ds-1', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findUnique.mockResolvedValue(existing);
      mockPrisma.dataSource.delete.mockResolvedValue(existing);

      const result = await service.remove('ds-1', 'tenant-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
      });
    });

    it('should throw when removing non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { widgets: true },
      });
    });
  });
});

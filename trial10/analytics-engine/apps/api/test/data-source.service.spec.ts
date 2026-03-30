import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';

// TRACED: AE-DS-003
describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: PrismaService;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockDataSource = {
    id: '880e8400-e29b-41d4-a716-446655440003',
    name: 'Test DB',
    type: 'POSTGRESQL',
    connectionUrl: 'postgresql://localhost:5432/test',
    tenantId,
    isActive: true,
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
  };

  const mockDataSources = [mockDataSource];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        {
          provide: PrismaService,
          useValue: {
            dataSource: {
              create: jest.fn().mockResolvedValue(mockDataSource),
              findMany: jest.fn().mockResolvedValue(mockDataSources),
              findUnique: jest.fn().mockResolvedValue(mockDataSource),
              update: jest.fn().mockResolvedValue({ ...mockDataSource, name: 'Updated' }),
              delete: jest.fn().mockResolvedValue(mockDataSource),
              count: jest.fn().mockResolvedValue(1),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a data source with tenant isolation', async () => {
      const result = await service.create(tenantId, {
        name: 'Test DB',
        type: 'POSTGRESQL',
        connectionUrl: 'postgresql://localhost:5432/test',
      });

      expect(result.name).toBe('Test DB');
      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId }),
        }),
      );
    });

    it('should default isActive to true', async () => {
      await service.create(tenantId, {
        name: 'Test',
        type: 'MYSQL',
        connectionUrl: 'mysql://localhost',
      });

      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources for tenant', async () => {
      const result = await service.findAll(tenantId);

      expect(result.items).toEqual(mockDataSources);
      expect(result.total).toBe(1);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      await service.findAll(tenantId, '1', '5');

      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a data source by id within tenant', async () => {
      const result = await service.findOne(tenantId, mockDataSource.id);

      expect(result.id).toBe(mockDataSource.id);
      expect(prisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockDataSource.id },
        }),
      );
    });

    it('should throw NotFoundException for non-existent data source', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dataSource.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDataSource,
        tenantId: 'different-tenant',
      });

      await expect(service.findOne(tenantId, mockDataSource.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update data source name', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce(mockDataSource);

      const result = await service.update(tenantId, mockDataSource.id, {
        name: 'Updated',
      });

      expect(result.name).toBeDefined();
      expect(prisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockDataSource.id },
        }),
      );
    });

    it('should update isActive flag', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce(mockDataSource);

      await service.update(tenantId, mockDataSource.id, { isActive: false });

      expect(prisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce(mockDataSource);

      await service.remove(tenantId, mockDataSource.id);

      expect(prisma.dataSource.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockDataSource.id } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent data source', async () => {
      (prisma.dataSource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

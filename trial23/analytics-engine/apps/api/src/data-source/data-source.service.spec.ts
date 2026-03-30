import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dataSource: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  syncHistory: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DataSourceService);
  });

  describe('findAll', () => {
    it('should return paginated data sources scoped by tenantId', async () => {
      const sources = [{ id: '1', name: 'API', tenantId: 't1' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('t1', 1, 10);

      expect(result.data).toEqual(sources);
      expect(result.total).toBe(1);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.dataSource.count).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenantId', async () => {
      const source = { id: '1', name: 'API', tenantId: 't1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(source);

      const result = await service.findOne('1', 't1');

      expect(result).toEqual(source);
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 't1' },
      });
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 't1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: '999', tenantId: 't1' },
      });
    });
  });

  describe('create', () => {
    it('should create a data source with tenantId', async () => {
      const dto = { name: 'API Source', type: 'REST' };
      const created = { id: '1', ...dto, tenantId: 't1', config: null, status: 'active' };
      mockPrisma.dataSource.create.mockResolvedValue(created);

      const result = await service.create('t1', dto);

      expect(result).toEqual(created);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: {
          name: 'API Source',
          type: 'REST',
          config: null,
          tenantId: 't1',
          status: 'active',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a data source after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'Old', tenantId: 't1' };
      const updated = { id: '1', name: 'Updated API', tenantId: 't1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.update.mockResolvedValue(updated);

      const result = await service.update('1', 't1', { name: 'Updated API' });

      expect(result).toEqual(updated);
      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated API' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a data source after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'API', tenantId: 't1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.delete.mockResolvedValue(existing);

      const result = await service.remove('1', 't1');

      expect(result).toEqual(existing);
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  const mockPrisma = {
    dataSource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const mockDs = {
    id: 'ds-1',
    name: 'Test DB',
    type: 'POSTGRESQL',
    connectionString: null,
    status: 'ACTIVE',
    tenantId,
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
  };

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

  it('should create a data source', async () => {
    mockPrisma.dataSource.create.mockResolvedValue(mockDs);

    const result = await service.create({ name: 'Test DB', type: 'POSTGRESQL' }, tenantId);
    expect(result).toEqual(mockDs);
    expect(mockPrisma.dataSource.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Test DB', tenantId }),
      }),
    );
  });

  it('should find all data sources', async () => {
    mockPrisma.dataSource.findMany.mockResolvedValue([mockDs]);
    mockPrisma.dataSource.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId);
    expect(result.items).toEqual([mockDs]);
    expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      }),
    );
  });

  it('should find one data source by id', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(mockDs);

    const result = await service.findOne('ds-1', tenantId);
    expect(result).toEqual(mockDs);
    expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ds-1' } }),
    );
  });

  it('should throw NotFoundException for missing data source', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', tenantId)).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should update a data source', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(mockDs);
    mockPrisma.dataSource.update.mockResolvedValue({ ...mockDs, name: 'Updated DB' });

    const result = await service.update('ds-1', { name: 'Updated DB' }, tenantId);
    expect(result.name).toBe('Updated DB');
    expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ds-1' } }),
    );
  });

  it('should delete a data source', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(mockDs);
    mockPrisma.dataSource.delete.mockResolvedValue(mockDs);

    await service.remove('ds-1', tenantId);
    expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
  });

  it('should get connection stats', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(5);

    const result = await service.getConnectionStats(tenantId);
    expect(result).toEqual({ activeConnections: 5 });
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  dataSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
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

  it('should create a data source with tenant isolation', async () => {
    const mockDS = { id: '1', name: 'DS1', type: 'POSTGRESQL', tenantId: 't1', widgets: [] };
    mockPrisma.dataSource.create.mockResolvedValue(mockDS);

    const result = await service.create({ name: 'DS1', type: 'POSTGRESQL' }, 't1');
    expect(result).toEqual(mockDS);
    expect(mockPrisma.dataSource.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'DS1', tenantId: 't1' }),
      }),
    );
  });

  it('should find all data sources for a tenant', async () => {
    const mockSources = [{ id: '1', name: 'DS1', tenantId: 't1' }];
    mockPrisma.dataSource.findMany.mockResolvedValue(mockSources);
    mockPrisma.dataSource.count.mockResolvedValue(1);

    const result = await service.findAll('t1', {});
    expect(result.data).toEqual(mockSources);
    expect(result.total).toBe(1);
    expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1' },
      }),
    );
  });

  it('should throw NotFoundException for non-existent data source', async () => {
    mockPrisma.dataSource.findFirst.mockResolvedValue(null);

    await expect(service.findOne('bad-id', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bad-id', tenantId: 't1' } }),
    );
  });

  it('should update a data source', async () => {
    const existing = { id: '1', name: 'Old', tenantId: 't1', widgets: [] };
    const updated = { id: '1', name: 'New', tenantId: 't1', widgets: [] };
    mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
    mockPrisma.dataSource.update.mockResolvedValue(updated);

    const result = await service.update('1', { name: 'New' }, 't1');
    expect(result.name).toBe('New');
    expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ name: 'New' }),
      }),
    );
  });

  it('should delete a data source', async () => {
    const existing = { id: '1', name: 'DS1', tenantId: 't1', widgets: [] };
    mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
    mockPrisma.dataSource.delete.mockResolvedValue(existing);

    await service.remove('1', 't1');
    expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});

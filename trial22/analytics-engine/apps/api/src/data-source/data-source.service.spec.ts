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

  it('should find all data sources with tenant scoping', async () => {
    mockPrisma.dataSource.findMany.mockResolvedValue([{ id: '1', name: 'DS' }]);
    mockPrisma.dataSource.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find one data source by id', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });

    const result = await service.findOne('1', 'tenant-1');

    expect(mockPrisma.dataSource.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when data source not found', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dataSource.findUnique).toHaveBeenCalled();
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });

    await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dataSource.findUnique).toHaveBeenCalled();
  });

  it('should create a data source', async () => {
    const dto = { name: 'PG', type: 'postgresql', connectionString: 'pg://localhost' };
    mockPrisma.dataSource.create.mockResolvedValue({ id: '1', ...dto, tenantId: 'tenant-1' });

    const result = await service.create(dto, 'tenant-1');

    expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'PG', tenantId: 'tenant-1' }),
    });
    expect(result.name).toBe('PG');
  });

  it('should update a data source', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.dataSource.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const result = await service.update('1', { name: 'Updated' }, 'tenant-1');

    expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('should delete a data source', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.dataSource.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1', 'tenant-1');

    expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });
});

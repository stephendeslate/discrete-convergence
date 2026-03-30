import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    syncHistory: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      syncHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should create a data source', async () => {
    const dto = { name: 'API Source', type: 'REST' };
    const expected = { id: 'ds-1', ...dto, organizationId: 'org-1', status: 'ACTIVE' };
    prisma.dataSource.create.mockResolvedValue(expected);

    const result = await service.create('org-1', dto);
    expect(result).toEqual(expected);
    expect(prisma.dataSource.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: 'org-1', status: 'ACTIVE' }),
    });
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);

    await expect(service.findOne('org-1', 'ds-999')).rejects.toThrow(NotFoundException);
  });

  it('should sync a data source and create sync history', async () => {
    const dataSource = { id: 'ds-1', organizationId: 'org-1' };
    prisma.dataSource.findFirst.mockResolvedValue(dataSource);
    prisma.dataSource.update.mockResolvedValue(dataSource);
    const syncRecord = { id: 'sh-1', dataSourceId: 'ds-1', status: 'SUCCESS' };
    prisma.syncHistory.create.mockResolvedValue(syncRecord);

    const result = await service.sync('org-1', 'ds-1');
    expect(result).toEqual(syncRecord);
    expect(prisma.syncHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ dataSourceId: 'ds-1', status: 'SUCCESS' }),
    });
  });

  it('should track FAILED status in sync history on error', async () => {
    const dataSource = { id: 'ds-1', organizationId: 'org-1' };
    prisma.dataSource.findFirst.mockResolvedValue(dataSource);
    prisma.dataSource.update.mockRejectedValue(new Error('DB error'));
    const syncRecord = { id: 'sh-1', dataSourceId: 'ds-1', status: 'FAILED' };
    prisma.syncHistory.create.mockResolvedValue(syncRecord);

    const result = await service.sync('org-1', 'ds-1');
    expect(result.status).toBe('FAILED');
  });
});

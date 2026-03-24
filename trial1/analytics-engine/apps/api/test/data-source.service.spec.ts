import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      syncRun: {
        create: jest.fn(),
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
    prisma['dataSource'].create.mockResolvedValue({ id: '1', name: 'API' });
    const result = await service.create('t1', { name: 'API', type: 'REST_API' });
    expect(result).toHaveProperty('id');
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma['dataSource'].findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: {
    create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock;
    update: jest.Mock; remove: jest.Mock; triggerSync: jest.Mock; getSyncHistory: jest.Mock;
  };

  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN' } };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'ds1' }),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      findOne: jest.fn().mockResolvedValue({ id: 'ds1' }),
      update: jest.fn().mockResolvedValue({ id: 'ds1' }),
      remove: jest.fn().mockResolvedValue(undefined),
      triggerSync: jest.fn().mockResolvedValue({ id: 'sr1' }),
      getSyncHistory: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: service }],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should create data source', async () => {
    await controller.create(mockReq as never, { name: 'DS', type: 'REST' as never });
    expect(service.create).toHaveBeenCalledWith('t1', expect.objectContaining({ name: 'DS' }));
  });

  it('should find all', async () => {
    await controller.findAll(mockReq as never, { page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should trigger sync', async () => {
    await controller.triggerSync(mockReq as never, 'ds1');
    expect(service.triggerSync).toHaveBeenCalledWith('t1', 'ds1');
  });

  it('should get sync history', async () => {
    await controller.syncHistory(mockReq as never, 'ds1');
    expect(service.getSyncHistory).toHaveBeenCalledWith('t1', 'ds1');
  });
});

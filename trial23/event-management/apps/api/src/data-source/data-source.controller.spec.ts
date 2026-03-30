import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    sync: jest.Mock;
    getSyncHistory: jest.Mock;
  };

  const mockReq = {
    user: { sub: 'user-1', email: 'u@test.com', role: 'ADMIN', organizationId: 'org-1' },
  } as never;

  const mockRes = {
    setHeader: jest.fn(),
  } as never;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      sync: jest.fn(),
      getSyncHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: service }],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should list data sources', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    service.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll(mockReq, mockRes, {});
    expect(result).toEqual(paginated);
  });

  it('should trigger a sync', async () => {
    const syncResult = { id: 'sh-1', status: 'SUCCESS' };
    service.sync.mockResolvedValue(syncResult);

    const result = await controller.sync(mockReq, 'ds-1');
    expect(result).toEqual(syncResult);
    expect(service.sync).toHaveBeenCalledWith('org-1', 'ds-1');
  });

  it('should get sync history', async () => {
    const paginated = { data: [{ id: 'sh-1' }], total: 1, page: 1, limit: 20 };
    service.getSyncHistory.mockResolvedValue(paginated);

    const result = await controller.getSyncHistory(mockReq, mockRes, 'ds-1', {});
    expect(result).toEqual(paginated);
  });
});

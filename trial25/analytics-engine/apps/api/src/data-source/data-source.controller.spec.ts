// TRACED:DS-CTRL-TEST — Data source controller tests
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { Request } from 'express';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    sync: jest.Mock;
    testConnection: jest.Mock;
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' },
  } as unknown as Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue({ id: '1' }),
      sync: jest.fn().mockResolvedValue({ syncId: 's1', status: 'COMPLETED' }),
      testConnection: jest.fn().mockResolvedValue({ success: true }),
    };
    controller = new DataSourceController(
      service as unknown as DataSourceService,
    );
  });

  it('should list data sources', async () => {
    const result = await controller.findAll(mockReq, { page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should sync a data source', async () => {
    const result = await controller.sync(mockReq, '1');
    expect(result.status).toBe('COMPLETED');
    expect(result.syncId).toBe('s1');
  });

  it('should test connection', async () => {
    const result = await controller.testConnection(mockReq, '1');
    expect(result.success).toBe(true);
    expect(service.testConnection).toHaveBeenCalledWith('1', 't1');
  });
});

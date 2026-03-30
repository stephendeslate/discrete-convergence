// TRACED:SYNC-CTRL-TEST — Sync history controller tests
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';
import { Request } from 'express';

describe('SyncHistoryController', () => {
  let controller: SyncHistoryController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' },
  } as unknown as Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
    };
    controller = new SyncHistoryController(
      service as unknown as SyncHistoryService,
    );
  });

  it('should list sync histories', async () => {
    const result = await controller.findAll(mockReq, { page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(result.meta).toBeDefined();
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should get a sync history by id', async () => {
    const result = await controller.findOne(mockReq, '1');
    expect(result.id).toBe('1');
    expect(service.findOne).toHaveBeenCalledWith('1', 't1');
  });
});

// TRACED:SYNC-HISTORY-CONTROLLER-SPEC
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';
import { Request } from 'express';
import { PaginatedQuery } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';

describe('SyncHistoryController', () => {
  let controller: SyncHistoryController;
  let service: jest.Mocked<SyncHistoryService>;
  const user: AuthenticatedUser = { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' };
  const req = { user } as unknown as Request;

  beforeEach(() => {
    service = {
      findByDataSource: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: 'sh-1', status: 'COMPLETED' }),
      triggerSync: jest.fn().mockResolvedValue({ id: 'sh-2', status: 'PENDING' }),
    } as unknown as jest.Mocked<SyncHistoryService>;
    controller = new SyncHistoryController(service);
  });

  it('should find sync histories by data source', async () => {
    const query: PaginatedQuery = { page: 1, limit: 20 };
    const result = await controller.findByDataSource('ds-1', query, req);
    expect(service.findByDataSource).toHaveBeenCalledWith('ds-1', 't-1', 1, 20);
    expect(result).toHaveProperty('data');
  });

  it('should find one sync history', async () => {
    const result = await controller.findOne('sh-1', req);
    expect(service.findOne).toHaveBeenCalledWith('sh-1', 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should trigger a sync', async () => {
    const result = await controller.triggerSync('ds-1', req);
    expect(service.triggerSync).toHaveBeenCalledWith('ds-1', 't-1');
    expect(result.status).toBe('PENDING');
  });
});

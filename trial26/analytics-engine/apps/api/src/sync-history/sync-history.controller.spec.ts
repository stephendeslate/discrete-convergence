import { Test, TestingModule } from '@nestjs/testing';
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';

describe('SyncHistoryController', () => {
  let controller: SyncHistoryController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAllForDataSource: jest.fn().mockResolvedValue({ data: [{ id: 'sh-1' }], total: 1, page: 1, limit: 20, totalPages: 1 }),
      findOne: jest.fn().mockResolvedValue({ id: 'sh-1', status: 'COMPLETED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncHistoryController],
      providers: [{ provide: SyncHistoryService, useValue: service }],
    }).compile();

    controller = module.get<SyncHistoryController>(SyncHistoryController);
  });

  it('should list sync history for a data source', async () => {
    const result = await controller.findAll('tenant-1', 'ds-1', { page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(service.findAllForDataSource).toHaveBeenCalledWith('tenant-1', 'ds-1', 1, 20);
  });

  it('should get a single sync run', async () => {
    const result = await controller.findOne('tenant-1', 'sh-1');
    expect(result.id).toBe('sh-1');
    expect(result.status).toBe('COMPLETED');
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'sh-1');
  });
});

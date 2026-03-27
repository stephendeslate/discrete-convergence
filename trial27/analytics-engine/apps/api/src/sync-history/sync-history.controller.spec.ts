import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';

describe('SyncHistoryController', () => {
  let controller: SyncHistoryController;
  let service: { findByDataSource: jest.Mock };

  const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;

  beforeEach(async () => {
    service = { findByDataSource: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncHistoryController],
      providers: [{ provide: SyncHistoryService, useValue: service }],
    }).compile();

    controller = module.get<SyncHistoryController>(SyncHistoryController);
  });

  it('should call findByDataSource with correct params', async () => {
    service.findByDataSource.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findAll(mockReq, 'ds-1', { page: 1, pageSize: 10 });

    expect(service.findByDataSource).toHaveBeenCalledWith('tenant-1', 'ds-1', 1, 10);
  });

  it('should return paginated sync history', async () => {
    const expected = { data: [{ id: 'sr-1' }], meta: { total: 1 } };
    service.findByDataSource.mockResolvedValue(expected);

    const result = await controller.findAll(mockReq, 'ds-1', {});

    expect(result).toEqual(expected);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'Prod DB', status: 'ACTIVE' }),
      findAll: jest.fn().mockResolvedValue({ data: [{ id: 'ds-1' }], total: 1, page: 1, limit: 20, totalPages: 1 }),
      findOne: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'Prod DB', status: 'ACTIVE' }),
      update: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'ds-1' }),
      testConnection: jest.fn().mockResolvedValue({ success: true, latencyMs: 42 }),
      sync: jest.fn().mockResolvedValue({ status: 'COMPLETED', recordsProcessed: 100 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: service }],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should create a data source and pass tenant context', async () => {
    const dto = { name: 'Prod DB', type: 'POSTGRESQL' as never, connectionConfig: '{}' };
    const result = await controller.create('tenant-1', dto);
    expect(result.id).toBe('ds-1');
    expect(result.name).toBe('Prod DB');
    expect(result.status).toBe('ACTIVE');
    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
    expect(service.create).toHaveBeenCalledTimes(1);
  });

  it('should list data sources with pagination', async () => {
    const result = await controller.findAll('tenant-1', { page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(service.findAll).toHaveBeenCalledWith('tenant-1', 1, 20);
  });

  it('should get single data source', async () => {
    const result = await controller.findOne('tenant-1', 'ds-1');
    expect(result.id).toBe('ds-1');
    expect(result.name).toBe('Prod DB');
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should test connection and return success', async () => {
    const result = await controller.testConnection('tenant-1', 'ds-1');
    expect(result.success).toBe(true);
    expect(result.latencyMs).toBe(42);
    expect(service.testConnection).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should sync data source and return result', async () => {
    const result = await controller.sync('tenant-1', 'ds-1');
    expect(result.status).toBe('COMPLETED');
    expect(result.recordsProcessed).toBe(100);
    expect(service.sync).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should delete a data source', async () => {
    await controller.remove('tenant-1', 'ds-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
    expect(service.remove).toHaveBeenCalledTimes(1);
  });
});

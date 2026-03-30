import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    publish: jest.Mock;
    archive: jest.Mock;
  };

  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'USER' } };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: '1' }),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue({ id: '1', status: 'PUBLISHED' }),
      archive: jest.fn().mockResolvedValue({ id: '1', status: 'ARCHIVED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should create dashboard with tenant context', async () => {
    await controller.create(mockReq as never, { title: 'Test' });
    expect(service.create).toHaveBeenCalledWith('t1', 'u1', { title: 'Test' });
  });

  it('should find all with pagination', async () => {
    await controller.findAll(mockReq as never, { page: 1, limit: 10 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should find one by id', async () => {
    await controller.findOne(mockReq as never, '1');
    expect(service.findOne).toHaveBeenCalledWith('t1', '1');
  });

  it('should publish dashboard', async () => {
    await controller.publish(mockReq as never, '1');
    expect(service.publish).toHaveBeenCalledWith('t1', '1');
  });
});

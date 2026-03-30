import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'dash-1', name: 'Sales', status: 'DRAFT', tenantId: 'tenant-1' }),
      findAll: jest.fn().mockResolvedValue({ data: [{ id: 'dash-1' }], total: 1, page: 1, limit: 20, totalPages: 1 }),
      findOne: jest.fn().mockResolvedValue({ id: 'dash-1', name: 'Sales', status: 'DRAFT' }),
      update: jest.fn().mockResolvedValue({ id: 'dash-1', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'dash-1' }),
      publish: jest.fn().mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED' }),
      archive: jest.fn().mockResolvedValue({ id: 'dash-1', status: 'ARCHIVED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should create a dashboard and pass tenant context', async () => {
    const result = await controller.create('tenant-1', { name: 'Sales' });
    expect(result.id).toBe('dash-1');
    expect(result.name).toBe('Sales');
    expect(result.status).toBe('DRAFT');
    expect(service.create).toHaveBeenCalledWith('tenant-1', { name: 'Sales' });
    expect(service.create).toHaveBeenCalledTimes(1);
  });

  it('should list dashboards with pagination params', async () => {
    const result = await controller.findAll('tenant-1', { page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(service.findAll).toHaveBeenCalledWith('tenant-1', 1, 20);
  });

  it('should get single dashboard by id', async () => {
    const result = await controller.findOne('tenant-1', 'dash-1');
    expect(result.id).toBe('dash-1');
    expect(result.name).toBe('Sales');
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should publish a dashboard', async () => {
    const result = await controller.publish('tenant-1', 'dash-1');
    expect(result.status).toBe('PUBLISHED');
    expect(service.publish).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should archive a dashboard', async () => {
    const result = await controller.archive('tenant-1', 'dash-1');
    expect(result.status).toBe('ARCHIVED');
    expect(service.archive).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should delete a dashboard', async () => {
    await controller.remove('tenant-1', 'dash-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'dash-1');
    expect(service.remove).toHaveBeenCalledTimes(1);
  });
});

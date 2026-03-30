// TRACED:DASH-CTRL-TEST — Dashboard controller tests
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
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
    };
    controller = new DashboardController(service as unknown as DashboardService);
  });

  it('should list dashboards', async () => {
    const result = await controller.findAll(mockReq, { page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should create a dashboard', async () => {
    const result = await controller.create(mockReq, { name: 'Test' });
    expect(result.id).toBe('1');
    expect(service.create).toHaveBeenCalledTimes(1);
  });

  it('should get a dashboard by id', async () => {
    const result = await controller.findOne(mockReq, '1');
    expect(result.id).toBe('1');
    expect(service.findOne).toHaveBeenCalledWith('1', 't1');
  });

  it('should update a dashboard', async () => {
    const result = await controller.update(mockReq, '1', { name: 'Updated' });
    expect(result.id).toBe('1');
    expect(service.update).toHaveBeenCalledTimes(1);
  });

  it('should delete a dashboard', async () => {
    const result = await controller.remove(mockReq, '1');
    expect(result.id).toBe('1');
    expect(service.remove).toHaveBeenCalledTimes(1);
  });
});

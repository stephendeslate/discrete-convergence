import { Test } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [{ provide: MaintenanceService, useValue: service }],
    }).compile();
    controller = module.get(MaintenanceController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await controller.findAll({ user: { tenantId: 't1' } } as any, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });
});

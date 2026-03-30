import { Test } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: service }],
    }).compile();
    controller = module.get(VehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service with tenantId', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 't1' } } as any;
    await controller.findAll(req, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    service.findOne.mockResolvedValue({ id: 'v1' });
    const req = { user: { tenantId: 't1' } } as any;
    const result = await controller.findOne('v1', req);
    expect(service.findOne).toHaveBeenCalledWith('v1', 't1');
    expect(result).toEqual({ id: 'v1' });
  });
});

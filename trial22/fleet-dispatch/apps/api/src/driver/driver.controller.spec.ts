import { Test } from '@nestjs/testing';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

describe('DriverController', () => {
  let controller: DriverController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [{ provide: DriverService, useValue: service }],
    }).compile();
    controller = module.get(DriverController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId from request and returns data', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 't1' } } as any;
    const result = await controller.findAll(req, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
    expect(result).toEqual({ data: [], total: 0 });
  });
});

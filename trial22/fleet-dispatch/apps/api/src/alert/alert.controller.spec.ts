import { Test } from '@nestjs/testing';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

describe('AlertController', () => {
  let controller: AlertController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; markRead: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), markRead: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [AlertController],
      providers: [{ provide: AlertService, useValue: service }],
    }).compile();
    controller = module.get(AlertController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId and returns data', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll({ user: { tenantId: 't1' } } as any, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total', 0);
  });
});

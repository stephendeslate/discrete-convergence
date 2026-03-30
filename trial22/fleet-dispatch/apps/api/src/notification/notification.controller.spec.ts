import { Test } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; markRead: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), markRead: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: service }],
    }).compile();
    controller = module.get(NotificationController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await controller.findAll({ user: { tenantId: 't1' } } as any, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });
});

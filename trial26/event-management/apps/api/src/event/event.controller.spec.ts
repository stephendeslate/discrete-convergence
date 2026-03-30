// Unit tests
import { Test } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  let eventService: Record<string, jest.Mock>;

  beforeEach(async () => {
    eventService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }),
      create: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }),
      update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated' }),
      remove: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue({ id: '1', status: 'PUBLISHED' }),
      cancel: jest.fn().mockResolvedValue({ id: '1', status: 'CANCELLED' }),
    };

    const module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: eventService }],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll with tenant context', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(eventService['findAll']).toHaveBeenCalledWith('t1', {});
  });

  it('should call create with tenant and user context', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    const dto = { title: 'Test', slug: 'test', startDate: '2025-01-01', endDate: '2025-01-02', capacity: 100 };
    await controller.create(req, dto);
    expect(eventService['create']).toHaveBeenCalledWith(dto, 't1', 'u1');
  });
});

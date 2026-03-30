import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    publish: jest.Mock;
    cancel: jest.Mock;
  };

  const mockReq = {
    user: { sub: 'user-1', email: 'u@test.com', role: 'ADMIN', organizationId: 'org-1' },
  } as never;

  const mockRes = {
    setHeader: jest.fn(),
  } as never;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      publish: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: service }],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should list events with pagination', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    service.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll(mockReq, mockRes, {});
    expect(result).toEqual(paginated);
    expect(service.findAll).toHaveBeenCalledWith('org-1', undefined, undefined);
  });

  it('should get a single event', async () => {
    const event = { id: 'evt-1', name: 'Test' };
    service.findOne.mockResolvedValue(event);

    const result = await controller.findOne(mockReq, 'evt-1');
    expect(result).toEqual(event);
    expect(service.findOne).toHaveBeenCalledWith('org-1', 'evt-1');
  });

  it('should create an event', async () => {
    const dto = { name: 'New Event', startDate: '2026-06-01T10:00:00Z', endDate: '2026-06-01T18:00:00Z' };
    const created = { id: 'evt-2', ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(created);
    expect(service.create).toHaveBeenCalledWith('org-1', dto);
  });

  it('should publish an event', async () => {
    const published = { id: 'evt-1', status: 'PUBLISHED' };
    service.publish.mockResolvedValue(published);

    const result = await controller.publish(mockReq, 'evt-1');
    expect(result).toEqual(published);
    expect(service.publish).toHaveBeenCalledWith('org-1', 'evt-1');
  });

  it('should cancel an event', async () => {
    const cancelled = { id: 'evt-1', status: 'CANCELLED' };
    service.cancel.mockResolvedValue(cancelled);

    const result = await controller.cancel(mockReq, 'evt-1');
    expect(result).toEqual(cancelled);
  });
});

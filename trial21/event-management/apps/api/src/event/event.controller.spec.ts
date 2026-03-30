import { Test } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

const mockEventService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  cancel: jest.fn(),
};

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();
    controller = module.get(EventController);
  });

  it('should create an event and pass organizationId', async () => {
    const event = { id: 'e1', title: 'Tech Conf', status: 'DRAFT' };
    mockEventService.create.mockResolvedValue(event);
    const req = { user: { organizationId: 'org1' } };
    const dto = {
      title: 'Tech Conf', slug: 'tech-conf', timezone: 'UTC',
      startDate: '2025-06-01T10:00:00Z', endDate: '2025-06-01T18:00:00Z',
    };

    const result = await controller.create(dto, req);
    expect(result.title).toBe('Tech Conf');
    expect(mockEventService.create).toHaveBeenCalledWith(dto, 'org1');
  });

  it('should return paginated events', async () => {
    const paginated = { data: [{ id: 'e1' }], total: 1 };
    mockEventService.findAll.mockResolvedValue(paginated);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findAll({ page: 1, limit: 20 }, req);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find a single event by id', async () => {
    const event = { id: 'e1', title: 'Found Event' };
    mockEventService.findOne.mockResolvedValue(event);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findOne('e1', req);
    expect(result.title).toBe('Found Event');
    expect(mockEventService.findOne).toHaveBeenCalledWith('e1', 'org1');
  });

  it('should publish an event', async () => {
    const published = { id: 'e1', status: 'PUBLISHED' };
    mockEventService.publish.mockResolvedValue(published);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.publish('e1', req);
    expect(result.status).toBe('PUBLISHED');
    expect(mockEventService.publish).toHaveBeenCalledWith('e1', 'org1');
  });

  it('should cancel an event', async () => {
    const cancelled = { id: 'e1', status: 'CANCELLED' };
    mockEventService.cancel.mockResolvedValue(cancelled);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.cancel('e1', req);
    expect(result.status).toBe('CANCELLED');
    expect(mockEventService.cancel).toHaveBeenCalledWith('e1', 'org1');
  });

  it('should delete an event', async () => {
    mockEventService.remove.mockResolvedValue({ id: 'e1' });
    const req = { user: { organizationId: 'org1' } };

    await controller.remove('e1', req);
    expect(mockEventService.remove).toHaveBeenCalledWith('e1', 'org1');
  });
});

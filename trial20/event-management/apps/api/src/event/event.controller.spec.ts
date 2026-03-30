import { Test } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

const mockEventService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();
    controller = module.get(EventController);
    jest.clearAllMocks();
  });

  it('should call create with tenant scoping', async () => {
    mockEventService.create.mockResolvedValue({ id: 'e-1' });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'ADMIN' } };
    const dto = { title: 'Test', startDate: '2025-06-01T00:00:00Z', endDate: '2025-06-01T12:00:00Z', maxAttendees: 100, ticketPrice: 25, venueId: 'v-1' };

    await controller.create(dto, req as never);

    expect(mockEventService.create).toHaveBeenCalledWith(dto, 'tenant-1');
  });

  it('should call findAll with pagination', async () => {
    mockEventService.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.findAll({ page: 1, limit: 10 }, req as never);

    expect(mockEventService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });
});

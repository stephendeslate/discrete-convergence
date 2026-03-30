import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

const mockEventService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();

    controller = module.get<EventController>(EventController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant and pagination', async () => {
    mockEventService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });

    expect(mockEventService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('should call findOne with id and tenant', async () => {
    mockEventService.findOne.mockResolvedValue({ id: 'e1', title: 'Test' });

    const result = await controller.findOne(mockReq as never, 'e1');

    expect(mockEventService.findOne).toHaveBeenCalledWith('e1', 't1');
    expect(result.id).toBe('e1');
  });

  it('should call create with tenant and dto', async () => {
    const dto = { title: 'New', startDate: '2026-01-01', endDate: '2026-01-02', capacity: 50 };
    mockEventService.create.mockResolvedValue({ id: 'e1', ...dto });

    const result = await controller.create(mockReq as never, dto);

    expect(mockEventService.create).toHaveBeenCalledWith('t1', dto);
    expect(result.id).toBe('e1');
  });

  it('should call remove with id and tenant', async () => {
    mockEventService.remove.mockResolvedValue({ id: 'e1' });

    await controller.remove(mockReq as never, 'e1');

    expect(mockEventService.remove).toHaveBeenCalledWith('e1', 't1');
  });
});

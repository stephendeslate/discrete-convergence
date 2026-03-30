import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  MAX_PAGE_SIZE: 100,
}));

const mockEventService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq: Pick<RequestWithUser, 'user'> = { user: { tenantId: 'tenant-1', sub: 'u1', email: 'a@b.com', role: 'ADMIN' } };

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

  it('should call eventService.create with tenantId and dto', async () => {
    const dto = { title: 'E1' };
    mockEventService.create.mockResolvedValue({ id: '1' });

    await controller.create(mockReq as unknown as RequestWithUser, dto as CreateEventDto);

    expect(mockEventService.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call eventService.findAll with tenantId and pagination', async () => {
    mockEventService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq as unknown as RequestWithUser, { page: 1, pageSize: 10 } as PaginatedQueryDto);

    expect(mockEventService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });

  it('should call eventService.findOne with tenantId and id', async () => {
    mockEventService.findOne.mockResolvedValue({ id: 'e1' });

    await controller.findOne(mockReq as unknown as RequestWithUser, 'e1');

    expect(mockEventService.findOne).toHaveBeenCalledWith('tenant-1', 'e1');
  });

  it('should call eventService.update with tenantId, id, dto', async () => {
    const dto = { title: 'Updated' };
    mockEventService.update.mockResolvedValue({ id: 'e1' });

    await controller.update(mockReq as unknown as RequestWithUser, 'e1', dto as UpdateEventDto);

    expect(mockEventService.update).toHaveBeenCalledWith('tenant-1', 'e1', dto);
  });

  it('should call eventService.remove with tenantId and id', async () => {
    mockEventService.remove.mockResolvedValue(undefined);

    await controller.remove(mockReq as unknown as RequestWithUser, 'e1');

    expect(mockEventService.remove).toHaveBeenCalledWith('tenant-1', 'e1');
  });
});

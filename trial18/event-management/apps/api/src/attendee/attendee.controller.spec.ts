import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  MAX_PAGE_SIZE: 100,
}));

const mockAttendeeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq: Pick<RequestWithUser, 'user'> = { user: { tenantId: 'tenant-1', sub: 'u1', email: 'a@b.com', role: 'ADMIN' } };

describe('AttendeeController', () => {
  let controller: AttendeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendeeController],
      providers: [{ provide: AttendeeService, useValue: mockAttendeeService }],
    }).compile();

    controller = module.get<AttendeeController>(AttendeeController);
    jest.clearAllMocks();
  });

  it('should call attendeeService.create with tenantId and dto', async () => {
    const dto = { name: 'John', email: 'j@b.com' };
    mockAttendeeService.create.mockResolvedValue({ id: '1' });

    await controller.create(mockReq as unknown as RequestWithUser, dto as CreateAttendeeDto);

    expect(mockAttendeeService.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call attendeeService.findAll with tenantId and pagination', async () => {
    mockAttendeeService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq as unknown as RequestWithUser, { page: 1, pageSize: 10 } as PaginatedQueryDto);

    expect(mockAttendeeService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });

  it('should call attendeeService.findOne with tenantId and id', async () => {
    mockAttendeeService.findOne.mockResolvedValue({ id: 'a1' });

    await controller.findOne(mockReq as unknown as RequestWithUser, 'a1');

    expect(mockAttendeeService.findOne).toHaveBeenCalledWith('tenant-1', 'a1');
  });

  it('should call attendeeService.update with tenantId, id, dto', async () => {
    const dto = { name: 'Jane' };
    mockAttendeeService.update.mockResolvedValue({ id: 'a1' });

    await controller.update(mockReq as unknown as RequestWithUser, 'a1', dto as UpdateAttendeeDto);

    expect(mockAttendeeService.update).toHaveBeenCalledWith('tenant-1', 'a1', dto);
  });

  it('should call attendeeService.remove with tenantId and id', async () => {
    mockAttendeeService.remove.mockResolvedValue(undefined);

    await controller.remove(mockReq as unknown as RequestWithUser, 'a1');

    expect(mockAttendeeService.remove).toHaveBeenCalledWith('tenant-1', 'a1');
  });
});

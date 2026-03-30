import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  MAX_PAGE_SIZE: 100,
}));

const mockRegistrationService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq: Pick<RequestWithUser, 'user'> = { user: { tenantId: 'tenant-1', sub: 'u1', email: 'a@b.com', role: 'ADMIN' } };

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: mockRegistrationService }],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    jest.clearAllMocks();
  });

  it('should call registrationService.create with tenantId and dto', async () => {
    const dto = { eventId: 'e1', attendeeId: 'a1' };
    mockRegistrationService.create.mockResolvedValue({ id: '1' });

    await controller.create(mockReq as unknown as RequestWithUser, dto as CreateRegistrationDto);

    expect(mockRegistrationService.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call registrationService.findAll with tenantId and pagination', async () => {
    mockRegistrationService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq as unknown as RequestWithUser, { page: 1, pageSize: 10 } as PaginatedQueryDto);

    expect(mockRegistrationService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });

  it('should call registrationService.findOne with tenantId and id', async () => {
    mockRegistrationService.findOne.mockResolvedValue({ id: 'r1' });

    await controller.findOne(mockReq as unknown as RequestWithUser, 'r1');

    expect(mockRegistrationService.findOne).toHaveBeenCalledWith('tenant-1', 'r1');
  });

  it('should call registrationService.update with tenantId, id, dto', async () => {
    const dto = { status: 'CONFIRMED' };
    mockRegistrationService.update.mockResolvedValue({ id: 'r1' });

    await controller.update(mockReq as unknown as RequestWithUser, 'r1', dto as UpdateRegistrationDto);

    expect(mockRegistrationService.update).toHaveBeenCalledWith('tenant-1', 'r1', dto);
  });

  it('should call registrationService.remove with tenantId and id', async () => {
    mockRegistrationService.remove.mockResolvedValue(undefined);

    await controller.remove(mockReq as unknown as RequestWithUser, 'r1');

    expect(mockRegistrationService.remove).toHaveBeenCalledWith('tenant-1', 'r1');
  });
});

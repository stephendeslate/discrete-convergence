import { Test, TestingModule } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  MAX_PAGE_SIZE: 100,
}));

const mockVenueService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq: Pick<RequestWithUser, 'user'> = { user: { tenantId: 'tenant-1', sub: 'u1', email: 'a@b.com', role: 'ADMIN' } };

describe('VenueController', () => {
  let controller: VenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: mockVenueService }],
    }).compile();

    controller = module.get<VenueController>(VenueController);
    jest.clearAllMocks();
  });

  it('should call venueService.create with tenantId and dto', async () => {
    const dto = { name: 'V1', address: 'Addr' };
    mockVenueService.create.mockResolvedValue({ id: '1' });

    await controller.create(mockReq as unknown as RequestWithUser, dto as CreateVenueDto);

    expect(mockVenueService.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call venueService.findAll with tenantId and pagination', async () => {
    mockVenueService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq as unknown as RequestWithUser, { page: 1, pageSize: 10 } as PaginatedQueryDto);

    expect(mockVenueService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });

  it('should call venueService.findOne with tenantId and id', async () => {
    mockVenueService.findOne.mockResolvedValue({ id: 'v1' });

    await controller.findOne(mockReq as unknown as RequestWithUser, 'v1');

    expect(mockVenueService.findOne).toHaveBeenCalledWith('tenant-1', 'v1');
  });

  it('should call venueService.update with tenantId, id, dto', async () => {
    const dto = { name: 'Updated' };
    mockVenueService.update.mockResolvedValue({ id: 'v1' });

    await controller.update(mockReq as unknown as RequestWithUser, 'v1', dto as UpdateVenueDto);

    expect(mockVenueService.update).toHaveBeenCalledWith('tenant-1', 'v1', dto);
  });

  it('should call venueService.remove with tenantId and id', async () => {
    mockVenueService.remove.mockResolvedValue(undefined);

    await controller.remove(mockReq as unknown as RequestWithUser, 'v1');

    expect(mockVenueService.remove).toHaveBeenCalledWith('tenant-1', 'v1');
  });
});

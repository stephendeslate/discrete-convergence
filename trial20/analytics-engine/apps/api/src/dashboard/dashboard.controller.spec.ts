import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RequestWithUser } from '../common/request-with-user';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = {
  user: { id: 'user-1', email: 'test@test.com', role: 'ADMIN', tenantId: 'tenant-1' },
} as unknown as RequestWithUser;

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get(DashboardController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant from request', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq, {});

    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', undefined, undefined);
  });

  it('should call findOne with id and tenant', async () => {
    mockService.findOne.mockResolvedValue({ id: 'd1' });

    await controller.findOne('d1', mockReq);

    expect(mockService.findOne).toHaveBeenCalledWith('d1', 'tenant-1');
  });

  it('should call create with dto, tenant, and user', async () => {
    mockService.create.mockResolvedValue({ id: 'd1' });

    await controller.create({ name: 'Test' }, mockReq);

    expect(mockService.create).toHaveBeenCalledWith({ name: 'Test' }, 'tenant-1', 'user-1');
  });

  it('should call remove with id and tenant', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('d1', mockReq);

    expect(mockService.remove).toHaveBeenCalledWith('d1', 'tenant-1');
  });
});

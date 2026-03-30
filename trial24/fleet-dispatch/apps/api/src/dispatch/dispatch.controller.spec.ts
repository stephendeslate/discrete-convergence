import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DispatchController', () => {
  const controller = new DispatchController(mockService as unknown as DispatchService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'dp1' });
    const result = await controller.findOne('dp1', user);
    expect(result.id).toBe('dp1');
  });

  it('create delegates to service', async () => {
    const dto = { vehicleId: 'v1', driverId: 'd1', routeId: 'r1', scheduledAt: '2024-01-01T00:00:00Z' };
    mockService.create.mockResolvedValue({ id: 'dp1', status: 'PENDING' });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'dp1' });
    await controller.update('dp1', { status: 'DISPATCHED' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('dp1', { status: 'DISPATCHED' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'dp1', status: 'CANCELLED' });
    await controller.remove('dp1', user);
    expect(mockService.remove).toHaveBeenCalledWith('dp1', 'c1');
  });
});

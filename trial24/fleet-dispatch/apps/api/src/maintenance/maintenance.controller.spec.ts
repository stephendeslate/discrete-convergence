import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MaintenanceController', () => {
  const controller = new MaintenanceController(mockService as unknown as MaintenanceService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'm1' });
    const result = await controller.findOne('m1', user);
    expect(result.id).toBe('m1');
  });

  it('create delegates to service', async () => {
    const dto = { vehicleId: 'v1', type: 'ROUTINE', description: 'Oil change', scheduledDate: '2024-06-01' };
    mockService.create.mockResolvedValue({ id: 'm1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'm1' });
    await controller.update('m1', { description: 'Updated' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('m1', { description: 'Updated' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'm1' });
    await controller.remove('m1', user);
    expect(mockService.remove).toHaveBeenCalledWith('m1', 'c1');
  });
});

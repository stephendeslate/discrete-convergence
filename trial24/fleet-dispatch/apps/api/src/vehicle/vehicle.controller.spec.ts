import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VehicleController', () => {
  const controller = new VehicleController(mockService as unknown as VehicleService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'v1' });
    const result = await controller.findOne('v1', user);
    expect(result.id).toBe('v1');
    expect(mockService.findOne).toHaveBeenCalledWith('v1', 'c1');
  });

  it('create delegates to service with companyId', async () => {
    const dto = { vin: 'V1', make: 'Ford', model: 'F150', year: 2023, licensePlate: 'XY-1' };
    mockService.create.mockResolvedValue({ id: 'v1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'v1' });
    await controller.update('v1', { make: 'Toyota' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('v1', { make: 'Toyota' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'v1', status: 'INACTIVE' });
    await controller.remove('v1', user);
    expect(mockService.remove).toHaveBeenCalledWith('v1', 'c1');
  });
});

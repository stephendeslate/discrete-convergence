import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DriverController', () => {
  const controller = new DriverController(mockService as unknown as DriverService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'd1' });
    const result = await controller.findOne('d1', user);
    expect(result.id).toBe('d1');
  });

  it('create delegates to service', async () => {
    const dto = { name: 'John', email: 'john@test.com', licenseNumber: 'DL-1' };
    mockService.create.mockResolvedValue({ id: 'd1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'd1' });
    await controller.update('d1', { name: 'Jane' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('d1', { name: 'Jane' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'd1', status: 'OFF_DUTY' });
    await controller.remove('d1', user);
    expect(mockService.remove).toHaveBeenCalledWith('d1', 'c1');
  });
});

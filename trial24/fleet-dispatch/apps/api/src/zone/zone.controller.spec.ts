import { ZoneController } from './zone.controller';
import { ZoneService } from './zone.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ZoneController', () => {
  const controller = new ZoneController(mockService as unknown as ZoneService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'z1' });
    const result = await controller.findOne('z1', user);
    expect(result.id).toBe('z1');
  });

  it('create delegates to service', async () => {
    const dto = { name: 'Downtown', polygon: { type: 'Polygon', coordinates: [[0, 0]] } };
    mockService.create.mockResolvedValue({ id: 'z1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'z1' });
    await controller.update('z1', { name: 'Uptown' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('z1', { name: 'Uptown' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'z1' });
    await controller.remove('z1', user);
    expect(mockService.remove).toHaveBeenCalledWith('z1', 'c1');
  });
});

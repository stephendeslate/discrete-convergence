import { RouteController } from './route.controller';
import { RouteService } from './route.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RouteController', () => {
  const controller = new RouteController(mockService as unknown as RouteService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'r1' });
    const result = await controller.findOne('r1', user);
    expect(result.id).toBe('r1');
  });

  it('create delegates to service', async () => {
    const dto = { name: 'Route A', origin: 'A', destination: 'B', distanceKm: 100, estimatedMinutes: 60 };
    mockService.create.mockResolvedValue({ id: 'r1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'r1' });
    await controller.update('r1', { name: 'Route B' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('r1', { name: 'Route B' }, 'c1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'r1' });
    await controller.remove('r1', user);
    expect(mockService.remove).toHaveBeenCalledWith('r1', 'c1');
  });
});

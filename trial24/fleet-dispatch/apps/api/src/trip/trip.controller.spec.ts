import { TripController } from './trip.controller';
import { TripService } from './trip.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('TripController', () => {
  const controller = new TripController(mockService as unknown as TripService);
  const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1' };

  beforeEach(() => jest.clearAllMocks());

  it('findAll delegates to service with companyId', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 20 }, user);
    expect(mockService.findAll).toHaveBeenCalledWith('c1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'tr1' });
    const result = await controller.findOne('tr1', user);
    expect(result.id).toBe('tr1');
  });

  it('create delegates to service', async () => {
    const dto = { dispatchId: 'd1', startedAt: '2024-01-01T00:00:00Z' };
    mockService.create.mockResolvedValue({ id: 'tr1', ...dto });
    await controller.create(dto as never, user);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'c1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'tr1' });
    await controller.update('tr1', { notes: 'Updated' } as never, user);
    expect(mockService.update).toHaveBeenCalledWith('tr1', { notes: 'Updated' }, 'c1');
  });
});

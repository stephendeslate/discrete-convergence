import { Test } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

const mockVenueService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VenueController', () => {
  let controller: VenueController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: mockVenueService }],
    }).compile();
    controller = module.get(VenueController);
    jest.clearAllMocks();
  });

  it('should call create with tenant scoping', async () => {
    mockVenueService.create.mockResolvedValue({ id: 'v-1' });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'ADMIN' } };

    await controller.create({ name: 'Hall', address: '123 St', city: 'NYC', capacity: 500 }, req as never);

    expect(mockVenueService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Hall' }),
      'tenant-1',
    );
  });

  it('should call findAll with pagination', async () => {
    mockVenueService.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.findAll({ page: 1, limit: 10 }, req as never);

    expect(mockVenueService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });
});

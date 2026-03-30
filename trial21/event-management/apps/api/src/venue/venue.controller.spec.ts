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
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: mockVenueService }],
    }).compile();
    controller = module.get(VenueController);
  });

  it('should create a venue and pass organizationId', async () => {
    const venue = { id: 'v1', name: 'Hall A', capacity: 500 };
    mockVenueService.create.mockResolvedValue(venue);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.create({ name: 'Hall A', address: '123 Main', capacity: 500 }, req);
    expect(result).toEqual(venue);
    expect(mockVenueService.create).toHaveBeenCalledWith(
      { name: 'Hall A', address: '123 Main', capacity: 500 },
      'org1',
    );
  });

  it('should list paginated venues', async () => {
    const paginated = { data: [{ id: 'v1' }], total: 1 };
    mockVenueService.findAll.mockResolvedValue(paginated);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findAll({ page: 1, limit: 20 }, req);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find a single venue by id', async () => {
    const venue = { id: 'v1', name: 'Main Hall' };
    mockVenueService.findOne.mockResolvedValue(venue);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findOne('v1', req);
    expect(result.name).toBe('Main Hall');
    expect(mockVenueService.findOne).toHaveBeenCalledWith('v1', 'org1');
  });

  it('should update a venue', async () => {
    const updated = { id: 'v1', name: 'Updated Hall' };
    mockVenueService.update.mockResolvedValue(updated);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.update('v1', { name: 'Updated Hall' }, req);
    expect(result.name).toBe('Updated Hall');
    expect(mockVenueService.update).toHaveBeenCalledWith('v1', { name: 'Updated Hall' }, 'org1');
  });

  it('should delete a venue', async () => {
    mockVenueService.remove.mockResolvedValue({ id: 'v1' });
    const req = { user: { organizationId: 'org1' } };

    await controller.remove('v1', req);
    expect(mockVenueService.remove).toHaveBeenCalledWith('v1', 'org1');
  });
});

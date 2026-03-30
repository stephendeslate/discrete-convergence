// Unit tests
import { Test } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

describe('VenueController', () => {
  let controller: VenueController;
  let venueService: Record<string, jest.Mock>;

  beforeEach(async () => {
    venueService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Hall' }),
      create: jest.fn().mockResolvedValue({ id: '1', name: 'Hall' }),
      update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: venueService }],
    }).compile();

    controller = module.get<VenueController>(VenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(venueService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});

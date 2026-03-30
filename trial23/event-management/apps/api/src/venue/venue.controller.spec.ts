import { Test, TestingModule } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

describe('VenueController', () => {
  let controller: VenueController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = {
    user: { sub: 'user-1', email: 'u@test.com', role: 'ADMIN', organizationId: 'org-1' },
  } as never;

  const mockRes = {
    setHeader: jest.fn(),
  } as never;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: service }],
    }).compile();

    controller = module.get<VenueController>(VenueController);
  });

  it('should list venues with pagination', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    service.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll(mockReq, mockRes, {});
    expect(result).toEqual(paginated);
  });

  it('should get a single venue', async () => {
    const venue = { id: 'ven-1', name: 'Hall A' };
    service.findOne.mockResolvedValue(venue);

    const result = await controller.findOne(mockReq, 'ven-1');
    expect(result).toEqual(venue);
  });

  it('should create a venue', async () => {
    const dto = { name: 'New Venue', capacity: 200 };
    const created = { id: 'ven-2', ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(created);
  });
});

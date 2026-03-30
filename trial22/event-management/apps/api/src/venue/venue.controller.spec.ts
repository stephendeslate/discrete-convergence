import { Test, TestingModule } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('VenueController', () => {
  let controller: VenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: mockService }],
    }).compile();
    controller = module.get<VenueController>(VenueController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.total).toBe(0);
  });

  it('should call create with tenant and dto', async () => {
    const dto = { name: 'Hall', address: '123', city: 'NYC', capacity: 100 };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(mockReq as never, dto);
    expect(mockService.create).toHaveBeenCalledWith('t1', dto);
    expect(result.id).toBe('1');
  });

  it('should call remove with id and tenant', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove(mockReq as never, '1');
    expect(mockService.remove).toHaveBeenCalledWith('1', 't1');
  });
});

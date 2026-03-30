import { Test } from '@nestjs/testing';
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
  let controller: VehicleController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: mockService }],
    }).compile();
    controller = module.get(VehicleController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant id', async () => {
    const req = { user: { tenantId: 't1' } } as never;
    const res = { setHeader: jest.fn() } as never;
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(req, {}, res);
    expect(mockService.findAll).toHaveBeenCalledWith('t1', undefined, undefined);
    expect(result.total).toBe(0);
  });

  it('should call findOne with tenant id', async () => {
    const req = { user: { tenantId: 't1' } } as never;
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', req);
    expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });

  it('should call create with tenant id', async () => {
    const req = { user: { tenantId: 't1' } } as never;
    const dto = { name: 'V', licensePlate: 'LP', make: 'M', model: 'Mo', year: 2024, mileage: 0, costPerMile: 0.5 };
    mockService.create.mockResolvedValue({ id: '2', ...dto });
    await controller.create(dto, req);
    expect(mockService.create).toHaveBeenCalledWith(dto, 't1');
  });
});

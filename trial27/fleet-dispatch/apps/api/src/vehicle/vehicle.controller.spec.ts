// TRACED: FD-API-002 — Vehicle controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VehicleController', () => {
  let controller: VehicleController;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: mockService }],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto = { name: 'Truck', licensePlate: 'ABC-123' };
      mockService.create.mockResolvedValue({ id: 'v1', ...dto });

      const result = await controller.create(tenantId, dto as unknown as CreateVehicleDto);

      expect(result.name).toBe('Truck');
    });
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      mockService.findAll.mockResolvedValue({ data: [{ id: 'v1' }], meta: {} });

      const result = await controller.findAll(tenantId, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne', async () => {
      mockService.findOne.mockResolvedValue({ id: 'v1' });

      const result = await controller.findOne(tenantId, 'v1');

      expect(result.id).toBe('v1');
    });
  });

  describe('update', () => {
    it('should delegate to service.update', async () => {
      mockService.update.mockResolvedValue({ id: 'v1', name: 'Updated' });

      const result = await controller.update(tenantId, 'v1', { name: 'Updated' } as unknown as UpdateVehicleDto);

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove', async () => {
      mockService.remove.mockResolvedValue({ id: 'v1' });

      await controller.remove(tenantId, 'v1');

      expect(mockService.remove).toHaveBeenCalledWith(tenantId, 'v1');
    });
  });
});

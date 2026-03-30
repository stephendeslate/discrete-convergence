import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockPrisma = {
  vehicle: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('VehicleService', () => {
  let service: VehicleService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<VehicleService>(VehicleService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle with tenantId', async () => {
      const dto = { name: 'Truck A', licensePlate: 'ABC-123', make: 'Ford', model: 'F-150', year: 2023 };
      const created = { id: 'v-1', ...dto, tenantId };
      mockPrisma.vehicle.create.mockResolvedValue(created);

      const result = await service.create(tenantId, dto as CreateVehicleDto);

      expect(result).toEqual(created);
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Truck A', licensePlate: 'ABC-123', tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const vehicles = [{ id: 'v-1', tenantId }];
      mockPrisma.vehicle.findMany.mockResolvedValue(vehicles);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(expect.objectContaining({ data: vehicles, total: 1, page: 1, pageSize: 10 }));
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 }),
      );
      expect(mockPrisma.vehicle.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });

  describe('findOne', () => {
    it('should return vehicle when found with matching tenantId', async () => {
      const vehicle = { id: 'v-1', tenantId };
      mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.findOne(tenantId, 'v-1');

      expect(result).toEqual(vehicle);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });

    it('should throw NotFoundException when tenantId does not match', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'other-tenant' });

      await expect(service.findOne(tenantId, 'v-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });
  });

  describe('update', () => {
    it('should update vehicle after verifying ownership', async () => {
      const vehicle = { id: 'v-1', tenantId };
      mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);
      mockPrisma.vehicle.update.mockResolvedValue({ ...vehicle, name: 'Updated Truck' });

      await service.update(tenantId, 'v-1', { name: 'Updated Truck' } as UpdateVehicleDto);

      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 'v-1' } });
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v-1' } }),
      );
    });
  });
});

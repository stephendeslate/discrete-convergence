import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/common/prisma.service';

describe('VehicleService', () => {
  let service: VehicleService;
  const tenantId = 'tenant-1';

  const mockPrisma = {
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

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
    it('should create a vehicle with tenant context', async () => {
      const dto = { name: 'Truck Alpha', licensePlate: 'ABC-1234' };
      const expected = { id: 'v-1', ...dto, tenantId, status: 'AVAILABLE' };
      mockPrisma.vehicle.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, name: 'Truck Alpha' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return vehicles for tenant with pagination', async () => {
      const vehicles = [{ id: 'v-1', name: 'Truck', tenantId }];
      mockPrisma.vehicle.findMany.mockResolvedValue(vehicles);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(vehicles);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should use default pagination when not specified', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id and tenant', async () => {
      const vehicle = { id: 'v-1', name: 'Truck', tenantId, dispatches: [] };
      mockPrisma.vehicle.findFirst.mockResolvedValue(vehicle);

      const result = await service.findOne(tenantId, 'v-1');

      expect(result).toEqual(vehicle);
      expect(mockPrisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: 'v-1', tenantId },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { dispatches: true },
      });
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const vehicle = { id: 'v-1', name: 'Truck', tenantId, dispatches: [] };
      mockPrisma.vehicle.findFirst.mockResolvedValue(vehicle);
      mockPrisma.vehicle.update.mockResolvedValue({ ...vehicle, name: 'Updated' });

      const result = await service.update(tenantId, 'v-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: { name: 'Updated' },
      });
    });

    it('should throw NotFoundException for non-existent vehicle on update', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v-1', tenantId, dispatches: [] });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v-1' });

      const result = await service.remove(tenantId, 'v-1');

      expect(result.id).toBe('v-1');
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });

    it('should throw NotFoundException when deleting non-existent vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.delete).not.toHaveBeenCalled();
    });
  });

  describe('executeRawTenantCount', () => {
    it('should execute raw query for tenant count', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(5);

      const result = await service.executeRawTenantCount(tenantId);

      expect(result).toBe(5);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});

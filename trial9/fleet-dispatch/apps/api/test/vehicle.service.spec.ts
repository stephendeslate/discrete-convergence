import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('VehicleService', () => {
  let service: VehicleService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      const dto = {
        licensePlate: 'FL-100',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        fuelCapacity: 80,
        costPerMile: 0.45,
      };
      const expected = { id: 'v-1', ...dto, tenantId, status: 'AVAILABLE' };
      mockPrisma.vehicle.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const mockVehicles = [{ id: 'v-1', tenantId }];
      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, '1', '10');
      expect(result.items).toEqual(mockVehicles);
      expect(result.total).toBe(1);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should return empty array when no vehicles', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      const mockVehicle = { id: 'v-1', tenantId, make: 'Ford' };
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.findOne(tenantId, 'v-1');
      expect(result).toEqual(mockVehicle);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        include: { dispatches: true, maintenances: true },
      });
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
        include: { dispatches: true, maintenances: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({
        id: 'v-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(tenantId, 'v-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId });
      const updated = { id: 'v-1', tenantId, make: 'Toyota' };
      mockPrisma.vehicle.update.mockResolvedValue(updated);

      const result = await service.update(tenantId, 'v-1', { make: 'Toyota' });
      expect(result).toEqual(updated);
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v-1' });

      const result = await service.remove(tenantId, 'v-1');
      expect(result).toEqual({ id: 'v-1' });
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });

    it('should throw NotFoundException when removing nonexistent vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFleetStats', () => {
    it('should execute raw query for fleet stats', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getFleetStats(tenantId);
      expect(result).toEqual({ rowsAffected: 5 });
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});

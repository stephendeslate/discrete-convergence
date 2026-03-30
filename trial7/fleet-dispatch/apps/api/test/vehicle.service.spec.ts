import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('VehicleService', () => {
  let service: VehicleService;
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

  describe('findOne', () => {
    it('should return a vehicle by id and tenantId', async () => {
      const vehicle = {
        id: 'v1',
        tenantId: 'tenant-1',
        licensePlate: 'FL-001',
        dispatches: [],
        maintenanceRecords: [],
      };
      mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.findOne('v1', 'tenant-1');
      expect(result).toEqual(vehicle);
    });

    it('should throw NotFoundException for non-existent vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.findOne('v999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({
        id: 'v1',
        tenantId: 'other-tenant',
      });
      await expect(service.findOne('v1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 999);
      expect(result.pageSize).toBe(100);
    });

    it('should handle empty page parameter', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      const dto = {
        tenantId: 'tenant-1',
        licensePlate: 'FL-001',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        mileage: 1000,
        fuelCostPerKm: 0.15,
      };
      mockPrisma.vehicle.create.mockResolvedValue({ id: 'v1', ...dto });

      const result = await service.create(dto);
      expect(result.id).toBe('v1');
      expect(mockPrisma.vehicle.create).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when deleting non-existent vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.remove('v999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

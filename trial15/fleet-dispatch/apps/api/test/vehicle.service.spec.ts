import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService, mockTenantId } from './helpers/test-utils';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      const dto = {
        name: 'Test Truck',
        licensePlate: 'XYZ-1234',
        make: 'Ford',
        model: 'F-150',
        year: 2024,
      };
      const mockVehicle = { id: 'v1', ...dto, tenantId: mockTenantId };
      prisma.vehicle.create.mockResolvedValue(mockVehicle);

      const result = await service.create(mockTenantId, dto);

      expect(result).toEqual(mockVehicle);
      expect(prisma.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const mockVehicles = [
        { id: 'v1', name: 'Truck A', tenantId: mockTenantId },
        { id: 'v2', name: 'Truck B', tenantId: mockTenantId },
      ];
      prisma.vehicle.findMany.mockResolvedValue(mockVehicles);
      prisma.vehicle.count.mockResolvedValue(2);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(mockVehicles);
      expect(result.total).toBe(2);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      prisma.vehicle.findMany.mockResolvedValue([]);
      prisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll(mockTenantId, 2, 5);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      const mockVehicle = { id: 'v1', name: 'Truck', tenantId: mockTenantId };
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.findOne(mockTenantId, 'v1');

      expect(result).toEqual(mockVehicle);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v1' },
      });
    });

    it('should throw NotFoundException for missing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockTenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({
        id: 'v1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(mockTenantId, 'v1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v1' },
      });
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const existing = { id: 'v1', name: 'Old', tenantId: mockTenantId };
      const updated = { id: 'v1', name: 'New', tenantId: mockTenantId };
      prisma.vehicle.findUnique.mockResolvedValue(existing);
      prisma.vehicle.update.mockResolvedValue(updated);

      const result = await service.update(mockTenantId, 'v1', { name: 'New' });

      expect(result).toEqual(updated);
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v1' },
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockTenantId, 'nonexistent', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.findUnique).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      const existing = { id: 'v1', tenantId: mockTenantId };
      prisma.vehicle.findUnique.mockResolvedValue(existing);
      prisma.vehicle.delete.mockResolvedValue(existing);

      const result = await service.remove(mockTenantId, 'v1');

      expect(result).toEqual(existing);
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 'v1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockTenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.vehicle.findUnique).toHaveBeenCalled();
    });
  });
});

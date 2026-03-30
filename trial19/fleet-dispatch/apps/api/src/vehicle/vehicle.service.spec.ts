import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  vehicle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('VehicleService', () => {
  let service: VehicleService;

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

  describe('findAll', () => {
    it('should return paginated vehicles for tenant', async () => {
      const mockVehicles = [{ id: 'v-1', tenantId: 'tenant-1' }];
      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(mockPrisma.vehicle.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
      expect(result.data).toEqual(mockVehicles);
      expect(result.total).toBe(1);
    });

    it('should use default pagination when no params provided', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id and tenant', async () => {
      const mockVehicle = { id: 'v-1', tenantId: 'tenant-1', licensePlate: 'ABC-123' };
      mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.findOne('v-1', 'tenant-1');

      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        include: { dispatches: true },
      });
      expect(result.licensePlate).toBe('ABC-123');
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.findOne('v-missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-missing' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when vehicle belongs to different tenant', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'other-tenant' });

      await expect(service.findOne('v-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        include: { dispatches: true },
      });
    });
  });

  describe('create', () => {
    it('should create a vehicle with tenant scope', async () => {
      const dto = { licensePlate: 'NEW-001', make: 'Ford', model: 'Transit', year: 2024, status: 'ACTIVE' };
      const created = { id: 'v-new', ...dto, tenantId: 'tenant-1' };
      mockPrisma.vehicle.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', dto);

      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1', licensePlate: 'NEW-001' }),
      });
      expect(result.id).toBe('v-new');
    });
  });

  describe('update', () => {
    it('should update an existing vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
      mockPrisma.vehicle.update.mockResolvedValue({ id: 'v-1', make: 'Toyota' });

      const result = await service.update('v-1', 'tenant-1', { make: 'Toyota' });

      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        include: { dispatches: true },
      });
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: expect.objectContaining({ make: 'Toyota' }),
      });
      expect(result.make).toBe('Toyota');
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v-1' });

      const result = await service.remove('v-1', 'tenant-1');

      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        include: { dispatches: true },
      });
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
      expect(result.id).toBe('v-1');
    });
  });
});

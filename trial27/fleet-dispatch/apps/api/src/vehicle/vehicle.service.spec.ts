// TRACED: FD-API-002 — Vehicle service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  vehicle: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
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
    it('should create a vehicle', async () => {
      const dto = { name: 'Truck 1', licensePlate: 'ABC-123' };
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);
      mockPrisma.vehicle.create.mockResolvedValue({ id: 'v1', ...dto, tenantId });

      const result = await service.create(tenantId, dto);

      expect(result.name).toBe('Truck 1');
      expect(mockPrisma.vehicle.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate license plate', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create(tenantId, { name: 'Truck', licensePlate: 'ABC-123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([{ id: 'v1' }]);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);

      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId });

      const result = await service.findOne(tenantId, 'v1');

      expect(result.id).toBe('v1');
    });

    it('should throw NotFoundException for non-existent vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId });
      mockPrisma.vehicle.update.mockResolvedValue({ id: 'v1', name: 'Updated' });

      const result = await service.update(tenantId, 'v1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException for duplicate plate on update', async () => {
      mockPrisma.vehicle.findFirst
        .mockResolvedValueOnce({ id: 'v1', tenantId }) // findOne
        .mockResolvedValueOnce({ id: 'v2', licensePlate: 'DUP' }); // duplicate check

      await expect(
        service.update(tenantId, 'v1', { licensePlate: 'DUP' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v1' });

      const result = await service.remove(tenantId, 'v1');

      expect(result.id).toBe('v1');
    });
  });
});

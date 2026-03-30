// TRACED:API-VEHICLE-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  vehicle: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('VehicleService', () => {
  let service: VehicleService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(VehicleService);
  });

  describe('findAll', () => {
    it('returns paginated vehicles', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([{ id: 'v1' }]);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('returns a vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', companyId });
      const result = await service.findOne('v1', companyId);
      expect(result.id).toBe('v1');
    });

    it('throws NotFoundException when vehicle not found', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.findOne('v1', companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a vehicle with companyId', async () => {
      const dto = { vin: 'ABC123', make: 'Ford', model: 'F150', year: 2023, licensePlate: 'XY-1' };
      mockPrisma.vehicle.create.mockResolvedValue({ id: 'v1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.vin).toBe('ABC123');
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
        data: { ...dto, companyId },
      });
    });
  });

  describe('update', () => {
    it('updates a vehicle after verifying it exists', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', companyId });
      mockPrisma.vehicle.update.mockResolvedValue({ id: 'v1', make: 'Toyota' });

      const result = await service.update('v1', { make: 'Toyota' } as never, companyId);
      expect(result.make).toBe('Toyota');
    });

    it('throws NotFoundException when vehicle not found for update', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.update('v1', {} as never, companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('sets vehicle status to INACTIVE', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', companyId });
      mockPrisma.vehicle.update.mockResolvedValue({ id: 'v1', status: 'INACTIVE' });

      const result = await service.remove('v1', companyId);
      expect(result.status).toBe('INACTIVE');
    });

    it('throws NotFoundException when vehicle not found for remove', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', companyId)).rejects.toThrow(NotFoundException);
    });
  });
});

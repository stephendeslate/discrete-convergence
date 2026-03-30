// TRACED:MAINTENANCE-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../infra/prisma.module';
import { MaintenanceTypeEnum } from './dto';

const mockPrisma = {
  maintenance: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vehicle: {
    findFirst: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(MaintenanceService);
  });

  describe('findAll', () => {
    it('returns paginated maintenance records', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([{ id: 'm1' }]);
      mockPrisma.maintenance.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('returns a maintenance record when found', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue({ id: 'm1', companyId, vehicle: {} });
      const result = await service.findOne('m1', companyId);
      expect(result.id).toBe('m1');
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });

    it('throws NotFoundException when record not found (error path)', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.maintenance.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', companyId } }),
      );
    });
  });

  describe('create', () => {
    it('creates a maintenance record with companyId', async () => {
      const dto = {
        vehicleId: 'v1',
        type: MaintenanceTypeEnum.ROUTINE,
        description: 'Routine oil change',
        scheduledDate: '2024-06-01',
        completedDate: '2024-06-02',
        cost: 150,
      };
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', companyId });
      mockPrisma.maintenance.create.mockResolvedValue({ id: 'm1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.type).toBe(MaintenanceTypeEnum.ROUTINE);
      expect(mockPrisma.maintenance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ vehicleId: 'v1', companyId }),
      });
    });

    it('creates record with null completedDate when not provided', async () => {
      const dto = {
        vehicleId: 'v1',
        type: MaintenanceTypeEnum.INSPECTION,
        description: 'Annual inspection',
        scheduledDate: '2024-06-01',
      };
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', companyId });
      mockPrisma.maintenance.create.mockResolvedValue({ id: 'm2', ...dto, completedDate: null, cost: null, companyId });

      const result = await service.create(dto, companyId);
      expect(result.completedDate).toBeNull();
      expect(result.cost).toBeNull();
      expect(mockPrisma.maintenance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ completedDate: null, cost: null }),
      });
    });

    it('throws NotFoundException when vehicle not found (error path)', async () => {
      const dto = {
        vehicleId: 'bad-vehicle',
        type: MaintenanceTypeEnum.ROUTINE,
        description: 'test',
        scheduledDate: '2024-06-01',
      };
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.create(dto, companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.maintenance.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates maintenance record fields', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue({ id: 'm1', companyId });
      mockPrisma.maintenance.update.mockResolvedValue({ id: 'm1', type: MaintenanceTypeEnum.REPAIR });

      const result = await service.update('m1', { type: MaintenanceTypeEnum.REPAIR }, companyId);
      expect(result.type).toBe(MaintenanceTypeEnum.REPAIR);
      expect(mockPrisma.maintenance.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { type: MaintenanceTypeEnum.REPAIR },
      });
    });

    it('updates with multiple partial fields', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue({ id: 'm1', companyId });
      mockPrisma.maintenance.update.mockResolvedValue({ id: 'm1', description: 'Updated', cost: 200 });

      const result = await service.update('m1', { description: 'Updated', cost: 200 }, companyId);
      expect(result.description).toBe('Updated');
      expect(result.cost).toBe(200);
    });

    it('throws NotFoundException when updating non-existent record (error path)', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { type: MaintenanceTypeEnum.ROUTINE }, companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.maintenance.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a maintenance record', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue({ id: 'm1', companyId });
      mockPrisma.maintenance.delete.mockResolvedValue({ id: 'm1' });

      const result = await service.remove('m1', companyId);
      expect(result.id).toBe('m1');
      expect(mockPrisma.maintenance.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    });

    it('throws NotFoundException when removing non-existent record (error path)', async () => {
      mockPrisma.maintenance.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.maintenance.delete).not.toHaveBeenCalled();
    });
  });
});

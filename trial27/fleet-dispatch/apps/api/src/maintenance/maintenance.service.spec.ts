// TRACED: FD-API-008 — Maintenance service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

const mockPrisma = {
  vehicle: { findFirst: jest.fn() },
  maintenanceLog: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
};

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  const tenantId = 'tenant-1';
  const vehicleId = 'v1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated maintenance logs', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: vehicleId, tenantId });
      mockPrisma.maintenanceLog.findMany.mockResolvedValue([{ id: 'm1' }]);
      mockPrisma.maintenanceLog.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, vehicleId);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw not found error for non-existent vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.findAll(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a maintenance log', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: vehicleId, tenantId });
      mockPrisma.maintenanceLog.create.mockResolvedValue({
        id: 'm1',
        type: 'OIL_CHANGE',
        vehicleId,
      });

      const dto = { type: 'OIL_CHANGE', description: 'Oil change' };
      const result = await service.create(tenantId, vehicleId, dto as unknown as CreateMaintenanceDto);

      expect(result.type).toBe('OIL_CHANGE');
    });

    it('should throw not found error when vehicle does not exist', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, 'nonexistent', { type: 'TIRE', description: 'test' } as unknown as CreateMaintenanceDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use default cost of 0 when cost is null', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: vehicleId, tenantId });
      mockPrisma.maintenanceLog.create.mockResolvedValue({ id: 'm2', cost: 0 });

      const dto = { type: 'BRAKE', description: 'Brake check' };
      await service.create(tenantId, vehicleId, dto as unknown as CreateMaintenanceDto);

      expect(mockPrisma.maintenanceLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ cost: 0 }),
        }),
      );
    });
  });
});

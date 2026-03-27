// TRACED: FD-API-004 — Dispatch job service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DispatchJobService } from './dispatch-job.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  dispatchJob: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  vehicle: { findFirst: jest.fn() },
  driver: { findFirst: jest.fn() },
};

describe('DispatchJobService', () => {
  let service: DispatchJobService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchJobService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchJobService>(DispatchJobService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispatch job', async () => {
      const dto = { origin: 'A', destination: 'B' };
      mockPrisma.dispatchJob.create.mockResolvedValue({ id: 'j1', ...dto, tenantId, status: 'PENDING' });

      const result = await service.create(tenantId, dto);

      expect(result.status).toBe('PENDING');
    });

    it('should validate vehicle belongs to tenant', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { origin: 'A', destination: 'B', vehicleId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate driver belongs to tenant', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { origin: 'A', destination: 'B', driverId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });

      const result = await service.findOne(tenantId, 'j1');

      expect(result.id).toBe('j1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete an in-progress job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'IN_PROGRESS' });
      mockPrisma.dispatchJob.update.mockResolvedValue({ id: 'j1', status: 'COMPLETED' });

      const result = await service.complete(tenantId, 'j1');

      expect(result.status).toBe('COMPLETED');
    });

    it('should reject completing a pending job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });

      await expect(service.complete(tenantId, 'j1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });
      mockPrisma.dispatchJob.update.mockResolvedValue({ id: 'j1', status: 'CANCELLED' });

      const result = await service.cancel(tenantId, 'j1');

      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancelling a completed job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'COMPLETED' });

      await expect(service.cancel(tenantId, 'j1')).rejects.toThrow(BadRequestException);
    });

    it('should return error when cancelling already cancelled job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'CANCELLED' });

      await expect(service.cancel(tenantId, 'j1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('should return not found error for invalid job id', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return error when updating completed job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'COMPLETED' });

      await expect(service.update(tenantId, 'j1', { origin: 'X' })).rejects.toThrow(BadRequestException);
    });

    it('should return error when updating cancelled job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'CANCELLED' });

      await expect(service.update(tenantId, 'j1', { origin: 'X' })).rejects.toThrow(BadRequestException);
    });

    it('should return error when assigning to completed job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'COMPLETED' });

      await expect(
        service.assign(tenantId, 'j1', { vehicleId: 'v1', driverId: 'd1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return not found error for invalid vehicle in assign', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(tenantId, 'j1', { vehicleId: 'bad', driverId: 'd1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return not found error for invalid driver in assign', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1' });
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(tenantId, 'j1', { vehicleId: 'v1', driverId: 'bad' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return error when completing a pending boundary job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });

      await expect(service.complete(tenantId, 'j1')).rejects.toThrow(BadRequestException);
    });

    it('should return error when completing a cancelled job', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'CANCELLED' });

      await expect(service.complete(tenantId, 'j1')).rejects.toThrow(BadRequestException);
    });

    it('should handle findAll with empty results', async () => {
      mockPrisma.dispatchJob.findMany.mockResolvedValue([]);
      mockPrisma.dispatchJob.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should delete a job via remove', async () => {
      mockPrisma.dispatchJob.findFirst.mockResolvedValue({ id: 'j1', tenantId, status: 'PENDING' });
      mockPrisma.dispatchJob.delete.mockResolvedValue({ id: 'j1' });

      const result = await service.remove(tenantId, 'j1');

      expect(result.id).toBe('j1');
    });

    it('should create job with scheduledAt date', async () => {
      mockPrisma.dispatchJob.create.mockResolvedValue({ id: 'j2', scheduledAt: new Date() });

      const result = await service.create(tenantId, { origin: 'A', destination: 'B', scheduledAt: '2025-01-01T00:00:00Z' });

      expect(mockPrisma.dispatchJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scheduledAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});

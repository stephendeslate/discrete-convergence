// TRACED:FD-TEST-002 — Work orders service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../common/services/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  const mockTx = {
    workOrder: {
      update: jest.fn(),
    },
  };

  const mockPrisma = {
    workOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a work order with companyId', async () => {
      const dto = {
        title: 'Fix AC',
        description: 'Unit not cooling',
        priority: 'HIGH' as const,
      };
      const expected = { id: 'wo-1', ...dto, companyId: 'c1', status: 'UNASSIGNED' };
      mockPrisma.workOrder.create.mockResolvedValue(expected);

      const result = await service.create('c1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId: 'c1', title: 'Fix AC' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const orders = [{ id: 'wo-1' }, { id: 'wo-2' }];
      mockPrisma.workOrder.findMany.mockResolvedValue(orders);
      mockPrisma.workOrder.count.mockResolvedValue(2);

      const result = await service.findAll('c1', 1, 20);

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(2);
      expect(result.pageSize).toBe(20);
    });

    it('should use default pagination when not specified', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      mockPrisma.workOrder.count.mockResolvedValue(0);

      const result = await service.findAll('c1');

      expect(result.page).toBe(1);
      expect(result.pageSize).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return work order if found and belongs to company', async () => {
      const order = { id: 'wo-1', companyId: 'c1' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);

      const result = await service.findOne('c1', 'wo-1');

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('c1', 'wo-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong companyId (multi-tenant isolation)', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({ id: 'wo-1', companyId: 'c2' });

      await expect(service.findOne('c1', 'wo-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should transition from UNASSIGNED to ASSIGNED', async () => {
      const order = { id: 'wo-1', companyId: 'c1', status: 'UNASSIGNED' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);
      const updated = { ...order, status: 'ASSIGNED' };
      mockTx.workOrder.update.mockResolvedValue(updated);

      const result = await service.updateStatus('c1', 'wo-1', WorkOrderStatus.ASSIGNED);

      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid state transitions', async () => {
      const order = { id: 'wo-1', companyId: 'c1', status: 'PAID' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);

      await expect(service.updateStatus('c1', 'wo-1', WorkOrderStatus.CANCELLED)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow CANCELLED from any non-terminal state', async () => {
      const order = { id: 'wo-1', companyId: 'c1', status: 'IN_PROGRESS' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);
      const updated = { ...order, status: 'CANCELLED' };
      mockTx.workOrder.update.mockResolvedValue(updated);

      const result = await service.updateStatus('c1', 'wo-1', WorkOrderStatus.CANCELLED);

      expect(result.status).toBe('CANCELLED');
    });

    it('should set completedAt when transitioning to COMPLETED', async () => {
      const order = { id: 'wo-1', companyId: 'c1', status: 'IN_PROGRESS' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);
      mockTx.workOrder.update.mockResolvedValue({ ...order, status: 'COMPLETED' });

      await service.updateStatus('c1', 'wo-1', WorkOrderStatus.COMPLETED);

      expect(mockTx.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete work order', async () => {
      const order = { id: 'wo-1', companyId: 'c1', status: 'UNASSIGNED' };
      mockPrisma.workOrder.findUnique.mockResolvedValue(order);
      mockPrisma.workOrder.delete.mockResolvedValue(order);

      const result = await service.delete('c1', 'wo-1');

      expect(result).toEqual({ deleted: true });
    });
  });
});

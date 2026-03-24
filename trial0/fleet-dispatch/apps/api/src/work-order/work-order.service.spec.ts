// TRACED:FD-TEST-008
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService } from './work-order.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  workOrder: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  workOrderStatusHistory: {
    create: vi.fn(),
  },
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkOrderService(mockPrisma as never);
  });

  describe('create', () => {
    it('creates work order with sequence number', async () => {
      mockPrisma.workOrder.count.mockResolvedValue(5);
      mockPrisma.workOrder.create.mockResolvedValue({
        id: 'wo1', sequenceNumber: 6, title: 'Fix sink', status: 'UNASSIGNED',
      });
      mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create(
        { title: 'Fix sink' },
        'comp1',
        'user1',
      );

      expect(result.title).toBe('Fix sink');
      expect(mockPrisma.workOrderStatusHistory.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('allows valid transition UNASSIGNED → ASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'UNASSIGNED', companyId: 'c1',
      });
      mockPrisma.workOrder.update.mockResolvedValue({ id: 'wo1', status: 'ASSIGNED' });
      mockPrisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.updateStatus('wo1', 'ASSIGNED' as never, 'c1', 'u1');
      expect(result.status).toBe('ASSIGNED');
    });

    it('rejects invalid transition UNASSIGNED → COMPLETED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'UNASSIGNED', companyId: 'c1',
      });

      await expect(
        service.updateStatus('wo1', 'COMPLETED' as never, 'c1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects transitions from PAID', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'PAID', companyId: 'c1',
      });

      await expect(
        service.updateStatus('wo1', 'CANCELLED' as never, 'c1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when not found', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    it('throws if work order is not UNASSIGNED', async () => {
      mockPrisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo1', status: 'ASSIGNED', companyId: 'c1',
      });

      await expect(
        service.assign('wo1', 'tech1', 'c1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

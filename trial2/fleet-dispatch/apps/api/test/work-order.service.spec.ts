import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Unit tests for WorkOrderService with mocked Prisma.
 * TRACED:FD-WO-004
 */
describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    workOrderStatusHistory: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
    $executeRaw: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      workOrderStatusHistory: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
      $executeRaw: jest.fn(),
    };

    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a work order', async () => {
      const expected = { id: '1', title: 'Test WO' };
      prisma.workOrder.create.mockResolvedValue(expected);

      const result = await service.create('company-1', {
        customerId: 'cust-1',
        title: 'Test WO',
      });

      expect(result).toEqual(expected);
      expect(prisma.workOrder.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a work order by id and companyId', async () => {
      const expected = { id: '1', companyId: 'company-1', title: 'Test' };
      prisma.workOrder.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('company-1', '1');

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('company-1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should reject invalid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        companyId: 'company-1',
        status: 'PAID',
      });

      await expect(
        service.updateStatus('company-1', '1', 'CANCELLED' as never, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: '1',
        companyId: 'company-1',
        status: 'UNASSIGNED',
      });

      const updatedWo = { id: '1', status: 'ASSIGNED' };
      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        return fn({
          workOrderStatusHistory: { create: jest.fn() },
          workOrder: { update: jest.fn().mockResolvedValue(updatedWo) },
        });
      });

      const result = await service.updateStatus('company-1', '1', 'ASSIGNED' as never, 'user-1');
      expect(result).toEqual(updatedWo);
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      prisma.workOrder.findMany.mockResolvedValue([{ id: '1' }]);
      prisma.workOrder.count.mockResolvedValue(1);

      const result = await service.findAll('company-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: '1', companyId: 'company-1' });
      prisma.workOrder.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('company-1', '1');
      expect(result).toEqual({ id: '1' });
    });
  });
});

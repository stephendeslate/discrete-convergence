import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    workOrderStatusHistory: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      workOrderStatusHistory: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      const mockData = [
        { id: '1', title: 'WO 1', companyId: 'c1' },
        { id: '2', title: 'WO 2', companyId: 'c1' },
      ];
      prisma.workOrder.findMany.mockResolvedValue(mockData);
      prisma.workOrder.count.mockResolvedValue(2);

      const result = await service.findAll('c1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('c1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if wrong company', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'other-company',
      });

      await expect(service.findOne('c1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return work order if found', async () => {
      const mockWO = { id: '1', companyId: 'c1', title: 'Test' };
      prisma.workOrder.findUnique.mockResolvedValue(mockWO);

      const result = await service.findOne('c1', '1');
      expect(result.title).toBe('Test');
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException for invalid transition', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'PAID',
      });

      await expect(
        service.updateStatus('c1', '1', 'CANCELLED', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transition', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        status: 'UNASSIGNED',
      });

      const updatedWO = { id: '1', status: 'ASSIGNED', companyId: 'c1' };
      prisma.$transaction.mockResolvedValue([updatedWO, {}]);

      const result = await service.updateStatus(
        'c1',
        '1',
        'ASSIGNED',
        'user-1',
      );
      expect(result.status).toBe('ASSIGNED');
    });
  });
});

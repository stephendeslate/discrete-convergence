import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/common/prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock; count: jest.Mock };
    workOrderStatusHistory: { create: jest.Mock };
    $executeRaw: jest.Mock;
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      workOrderStatusHistory: { create: jest.fn() },
      $executeRaw: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(service.findOne('company-1', 'nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid status transitions', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo-1',
      status: 'PAID',
      companyId: 'c1',
    });
    await expect(
      service.updateStatus('c1', 'wo-1', 'UNASSIGNED', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject assignment of non-assignable work orders', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo-1',
      status: 'COMPLETED',
      companyId: 'c1',
    });
    await expect(
      service.assign('c1', 'wo-1', 'tech-1', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return paginated results', async () => {
    prisma.workOrder.findMany.mockResolvedValue([]);
    prisma.workOrder.count.mockResolvedValue(0);
    const result = await service.findAll('c1', 1, 10);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.total).toBe(0);
  });
});

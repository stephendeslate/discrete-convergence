import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../infra/prisma.service';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    setTenantContext: jest.Mock;
  };

  const companyId = 'comp-1';

  beforeEach(async () => {
    prisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  it('should create a work order with default UNASSIGNED status', async () => {
    prisma.workOrder.create.mockResolvedValue({
      id: 'wo-1',
      title: 'Fix HVAC',
      status: 'UNASSIGNED',
      companyId,
    });

    const result = await service.create(companyId, { title: 'Fix HVAC' });

    expect(result.status).toBe('UNASSIGNED');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should return paginated work orders', async () => {
    prisma.workOrder.findMany.mockResolvedValue([{ id: 'wo-1' }]);
    prisma.workOrder.count.mockResolvedValue(1);

    const result = await service.findAll(companyId, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw 404 for non-existent work order', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should reject invalid status transition', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo-1',
      status: 'UNASSIGNED',
      companyId,
    });

    await expect(
      service.updateStatus(companyId, 'wo-1', 'COMPLETED'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow valid status transition UNASSIGNED -> ASSIGNED', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: 'wo-1',
      status: 'UNASSIGNED',
      companyId,
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo-1',
      status: 'ASSIGNED',
    });

    const result = await service.updateStatus(companyId, 'wo-1', 'ASSIGNED');

    expect(result.status).toBe('ASSIGNED');
  });
});

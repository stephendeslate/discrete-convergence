import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from '../src/work-order/work-order.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrisma } from './helpers/mock-prisma';
import {
  createTestWorkOrder,
  createTestTechnician,
  TENANT_ID,
  COMPANY_ID,
} from './helpers/factories';

describe('WorkOrder Integration', () => {
  let module: TestingModule;
  let service: WorkOrderService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    module = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WorkOrderService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create -> assign -> status progression', () => {
    it('should create, assign, and progress through statuses', async () => {
      // Create
      prisma.company.update.mockResolvedValue({ woSequence: 1 });
      const wo = createTestWorkOrder({ sequenceNumber: 'WO-00001' });
      prisma.workOrder.create.mockResolvedValue(wo);
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const created = await service.create(TENANT_ID, COMPANY_ID, {
        title: 'Fix HVAC',
      });
      expect(created.sequenceNumber).toBe('WO-00001');

      // Assign
      const tech = createTestTechnician();
      const assignedWo = { ...wo, technicianId: tech.id, status: 'ASSIGNED' };
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.technician.findUnique.mockResolvedValue(tech);
      prisma.$transaction.mockResolvedValue([assignedWo, {}]);

      const assigned = await service.assign(TENANT_ID, wo.id, tech.id);
      expect(assigned.status).toBe('ASSIGNED');

      // Progress to EN_ROUTE
      prisma.workOrder.findUnique.mockResolvedValue(assignedWo);
      prisma.$transaction.mockResolvedValue([
        { ...assignedWo, status: 'EN_ROUTE' },
        {},
      ]);

      const enRoute = await service.updateStatus(
        TENANT_ID,
        wo.id,
        'EN_ROUTE' as never,
      );
      expect(enRoute.status).toBe('EN_ROUTE');
    });
  });

  describe('status machine validation', () => {
    it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
      const wo = createTestWorkOrder({ status: 'UNASSIGNED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.updateStatus(TENANT_ID, wo.id, 'COMPLETED' as never),
      ).rejects.toThrow('Invalid transition');
    });

    it('should allow CANCELLED from IN_PROGRESS', async () => {
      const wo = createTestWorkOrder({ status: 'IN_PROGRESS' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.$transaction.mockResolvedValue([
        { ...wo, status: 'CANCELLED' },
        {},
      ]);

      const result = await service.updateStatus(
        TENANT_ID,
        wo.id,
        'CANCELLED' as never,
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('should not allow transitions from PAID', async () => {
      const wo = createTestWorkOrder({ status: 'PAID' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.updateStatus(TENANT_ID, wo.id, 'CANCELLED' as never),
      ).rejects.toThrow('Invalid transition');
    });
  });

  describe('tenant isolation', () => {
    it('should reject access to work order from different tenant', async () => {
      const wo = createTestWorkOrder({ tenantId: 'other-tenant' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.findOne(TENANT_ID, wo.id),
      ).rejects.toThrow('Work order not found');
    });
  });
});

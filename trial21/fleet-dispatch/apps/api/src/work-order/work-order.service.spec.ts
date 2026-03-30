import { WorkOrderService } from './work-order.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import {
  createTestWorkOrder,
  createTestTechnician,
  TENANT_ID,
  COMPANY_ID,
} from '../../test/helpers/factories';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new WorkOrderService(prisma as never);
  });

  describe('create', () => {
    it('should create a work order with sequence number', async () => {
      prisma.company.update.mockResolvedValue({ woSequence: 42 });
      const wo = createTestWorkOrder({ sequenceNumber: 'WO-00042' });
      prisma.workOrder.create.mockResolvedValue(wo);
      prisma.workOrderStatusHistory.create.mockResolvedValue({});

      const result = await service.create(TENANT_ID, COMPANY_ID, {
        title: 'Fix HVAC',
      });

      expect(result.sequenceNumber).toBeDefined();
      expect(prisma.workOrderStatusHistory.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const workOrders = [createTestWorkOrder(), createTestWorkOrder()];
      prisma.workOrder.findMany.mockResolvedValue(workOrders);
      prisma.workOrder.count.mockResolvedValue(2);

      const result = await service.findAll(TENANT_ID, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return work order with related data', async () => {
      const wo = createTestWorkOrder();
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      const result = await service.findOne(TENANT_ID, wo.id);
      expect(result.id).toBe(wo.id);
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(TENANT_ID, 'nonexistent'),
      ).rejects.toThrow('Work order not found');
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      const wo = createTestWorkOrder({ tenantId: 'other-tenant' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.findOne(TENANT_ID, wo.id),
      ).rejects.toThrow('Work order not found');
    });
  });

  describe('updateStatus', () => {
    it('should transition from UNASSIGNED to ASSIGNED', async () => {
      const wo = createTestWorkOrder({ status: 'UNASSIGNED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.$transaction.mockResolvedValue([
        { ...wo, status: 'ASSIGNED' },
        {},
      ]);

      const result = await service.updateStatus(TENANT_ID, wo.id, 'ASSIGNED' as never);
      expect(result.status).toBe('ASSIGNED');
    });

    it('should reject invalid transition from PAID', async () => {
      const wo = createTestWorkOrder({ status: 'PAID' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.updateStatus(TENANT_ID, wo.id, 'ASSIGNED' as never),
      ).rejects.toThrow('Invalid transition');
    });

    it('should reject transition from CANCELLED', async () => {
      const wo = createTestWorkOrder({ status: 'CANCELLED' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);

      await expect(
        service.updateStatus(TENANT_ID, wo.id, 'UNASSIGNED' as never),
      ).rejects.toThrow('Invalid transition');
    });

    it('should allow CANCELLED from most states', async () => {
      const wo = createTestWorkOrder({ status: 'IN_PROGRESS' });
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.$transaction.mockResolvedValue([
        { ...wo, status: 'CANCELLED' },
        {},
      ]);

      const result = await service.updateStatus(TENANT_ID, wo.id, 'CANCELLED' as never);
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('assign', () => {
    it('should assign technician to unassigned work order', async () => {
      const wo = createTestWorkOrder({ status: 'UNASSIGNED' });
      const tech = createTestTechnician();
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.technician.findUnique.mockResolvedValue(tech);
      prisma.$transaction.mockResolvedValue([
        { ...wo, technicianId: tech.id, status: 'ASSIGNED' },
        {},
      ]);

      const result = await service.assign(TENANT_ID, wo.id, tech.id);
      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw for technician not in tenant', async () => {
      const wo = createTestWorkOrder();
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.technician.findUnique.mockResolvedValue(
        createTestTechnician({ tenantId: 'other' }),
      );

      await expect(
        service.assign(TENANT_ID, wo.id, 'tech-id'),
      ).rejects.toThrow('Technician not found');
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for UNASSIGNED', () => {
      const transitions = service.getValidTransitions('UNASSIGNED' as never);
      expect(transitions).toContain('ASSIGNED');
      expect(transitions).toContain('CANCELLED');
      expect(transitions).not.toContain('COMPLETED');
    });
  });
});

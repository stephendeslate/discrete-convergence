import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';
import { createTestWorkOrder, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('WorkOrderController', () => {
  let controller: WorkOrderController;
  let service: jest.Mocked<WorkOrderService>;

  const mockUser = {
    sub: 'user-1',
    email: 'admin@test.com',
    role: 'ADMIN',
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
  };

  function mockRequest(): Request {
    return { user: mockUser } as unknown as Request;
  }

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      assign: jest.fn(),
    } as unknown as jest.Mocked<WorkOrderService>;
    controller = new WorkOrderController(service);
  });

  describe('create', () => {
    it('should delegate to service with tenant and company', async () => {
      const wo = createTestWorkOrder();
      service.create.mockResolvedValue(wo);

      const result = await controller.create(mockRequest(), { title: 'Fix HVAC' });

      expect(service.create).toHaveBeenCalledWith(
        TENANT_ID,
        COMPANY_ID,
        { title: 'Fix HVAC' },
      );
      expect(result.sequenceNumber).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      const paginated = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockRequest(), { page: 1, limit: 20 });

      expect(service.findAll).toHaveBeenCalledWith(TENANT_ID, 1, 20);
      expect(result.total).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('should delegate status change with user id', async () => {
      const wo = createTestWorkOrder({ status: 'ASSIGNED' });
      service.updateStatus.mockResolvedValue({ ...wo, status: 'EN_ROUTE' });

      const result = await controller.updateStatus(
        mockRequest(),
        wo.id,
        { status: 'EN_ROUTE' as never },
      );

      expect(service.updateStatus).toHaveBeenCalledWith(
        TENANT_ID,
        wo.id,
        'EN_ROUTE',
        'user-1',
      );
      expect(result.status).toBe('EN_ROUTE');
    });
  });

  describe('assign', () => {
    it('should delegate assignment with tenant context', async () => {
      const wo = createTestWorkOrder({ status: 'ASSIGNED' });
      service.assign.mockResolvedValue(wo);

      await controller.assign(mockRequest(), wo.id, { technicianId: 'tech-1' });

      expect(service.assign).toHaveBeenCalledWith(TENANT_ID, wo.id, 'tech-1');
    });
  });
});

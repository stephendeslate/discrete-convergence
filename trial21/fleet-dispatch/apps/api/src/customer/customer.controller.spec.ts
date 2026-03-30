import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { createTestCustomer, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: jest.Mocked<CustomerService>;

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
      getWorkOrders: jest.fn(),
    } as unknown as jest.Mocked<CustomerService>;
    controller = new CustomerController(service);
  });

  describe('create', () => {
    it('should delegate to service with tenant context', async () => {
      const customer = createTestCustomer();
      service.create.mockResolvedValue(customer);

      const result = await controller.create(mockRequest(), {
        name: 'Test Customer',
        address: '123 Main St',
      });

      expect(service.create).toHaveBeenCalledWith(
        TENANT_ID,
        COMPANY_ID,
        { name: 'Test Customer', address: '123 Main St' },
      );
      expect(result.name).toBe(customer.name);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const paginated = { data: [createTestCustomer()], total: 1, page: 1, limit: 10, totalPages: 1 };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockRequest(), { page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith(TENANT_ID, 1, 10);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      const customer = createTestCustomer();
      service.findOne.mockResolvedValue(customer);

      const result = await controller.findOne(mockRequest(), customer.id);

      expect(service.findOne).toHaveBeenCalledWith(TENANT_ID, customer.id);
      expect(result.id).toBe(customer.id);
    });
  });

  describe('getWorkOrders', () => {
    it('should return work orders for customer', async () => {
      service.getWorkOrders.mockResolvedValue([]);

      const result = await controller.getWorkOrders(mockRequest(), 'cust-1');

      expect(service.getWorkOrders).toHaveBeenCalledWith(TENANT_ID, 'cust-1');
      expect(result).toEqual([]);
    });
  });
});

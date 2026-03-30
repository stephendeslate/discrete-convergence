import { CustomerService } from './customer.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import {
  createTestCustomer,
  TENANT_ID,
  COMPANY_ID,
} from '../../test/helpers/factories';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CustomerService(prisma as never);
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const customer = createTestCustomer();
      prisma.customer.create.mockResolvedValue(customer);

      const result = await service.create(TENANT_ID, COMPANY_ID, {
        name: 'Test Customer',
        address: '123 Main St',
      });

      expect(result.name).toBe('Test Customer');
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      const customer = createTestCustomer();
      prisma.customer.findUnique.mockResolvedValue(customer);

      const result = await service.findOne(TENANT_ID, customer.id);
      expect(result.id).toBe(customer.id);
    });

    it('should throw for missing customer', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(TENANT_ID, 'nonexistent'),
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('getWorkOrders', () => {
    it('should return work orders for customer', async () => {
      const customer = createTestCustomer();
      prisma.customer.findUnique.mockResolvedValue(customer);
      prisma.workOrder.findMany.mockResolvedValue([]);

      const result = await service.getWorkOrders(TENANT_ID, customer.id);
      expect(result).toEqual([]);
    });

    it('should throw for wrong tenant customer', async () => {
      prisma.customer.findUnique.mockResolvedValue(
        createTestCustomer({ tenantId: 'other' }),
      );

      await expect(
        service.getWorkOrders(TENANT_ID, 'id'),
      ).rejects.toThrow('Customer not found');
    });
  });
});

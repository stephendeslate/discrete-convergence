import { MetricsService } from './metrics.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { TENANT_ID } from '../../test/helpers/factories';

describe('MetricsService', () => {
  let service: MetricsService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new MetricsService(prisma as never);
  });

  describe('getMetrics', () => {
    it('should return counts for all entities', async () => {
      prisma.workOrder.count.mockResolvedValue(10);
      prisma.technician.count.mockResolvedValue(5);
      prisma.customer.count.mockResolvedValue(20);
      prisma.invoice.count.mockResolvedValue(8);

      const result = await service.getMetrics(TENANT_ID);

      expect(result.workOrders).toBe(10);
      expect(result.technicians).toBe(5);
      expect(result.customers).toBe(20);
      expect(result.invoices).toBe(8);
      expect(result.timestamp).toBeDefined();
    });
  });
});

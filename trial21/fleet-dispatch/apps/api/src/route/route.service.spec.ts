import { RouteService } from './route.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { createTestRoute, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new RouteService(prisma as never);
  });

  describe('optimize', () => {
    it('should create a route with stops', async () => {
      const route = createTestRoute();
      prisma.route.create.mockResolvedValue(route);
      prisma.routeStop.create.mockResolvedValue({});
      prisma.route.findUnique.mockResolvedValue({ ...route, stops: [] });

      const result = await service.optimize(TENANT_ID, COMPANY_ID, {
        date: '2026-03-25',
        technicianId: 'tech-1',
        workOrderIds: ['wo-1', 'wo-2'],
      });

      expect(result).toBeDefined();
      expect(prisma.routeStop.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('reorder', () => {
    it('should reorder stops', async () => {
      const route = createTestRoute();
      prisma.route.findUnique.mockResolvedValue(route);
      prisma.routeStop.update.mockResolvedValue({});
      prisma.route.findUnique.mockResolvedValue({ ...route, stops: [] });

      await service.reorder(TENANT_ID, route.id, {
        stopIds: ['stop-2', 'stop-1'],
      });

      expect(prisma.routeStop.update).toHaveBeenCalledTimes(2);
    });

    it('should throw for wrong tenant route', async () => {
      prisma.route.findUnique.mockResolvedValue(
        createTestRoute({ tenantId: 'other' }),
      );

      await expect(
        service.reorder(TENANT_ID, 'route-id', { stopIds: [] }),
      ).rejects.toThrow('Route not found');
    });
  });
});

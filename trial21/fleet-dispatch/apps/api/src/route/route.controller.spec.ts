import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { createTestRoute, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('RouteController', () => {
  let controller: RouteController;
  let service: jest.Mocked<RouteService>;

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
      optimize: jest.fn(),
      getByDate: jest.fn(),
      reorder: jest.fn(),
    } as unknown as jest.Mocked<RouteService>;
    controller = new RouteController(service);
  });

  describe('optimize', () => {
    it('should delegate route optimization to service', async () => {
      const route = { ...createTestRoute(), stops: [] };
      service.optimize.mockResolvedValue(route);

      const result = await controller.optimize(mockRequest(), {
        date: '2026-03-25',
        technicianId: 'tech-1',
        workOrderIds: ['wo-1'],
      });

      expect(service.optimize).toHaveBeenCalledWith(
        TENANT_ID,
        COMPANY_ID,
        { date: '2026-03-25', technicianId: 'tech-1', workOrderIds: ['wo-1'] },
      );
      expect(result).toBeDefined();
    });
  });

  describe('getByDate', () => {
    it('should return routes for a given date', async () => {
      service.getByDate.mockResolvedValue([]);

      const result = await controller.getByDate(mockRequest(), '2026-03-25');

      expect(service.getByDate).toHaveBeenCalledWith(TENANT_ID, '2026-03-25');
      expect(result).toEqual([]);
    });
  });

  describe('reorder', () => {
    it('should delegate stop reordering to service', async () => {
      const route = { ...createTestRoute(), stops: [] };
      service.reorder.mockResolvedValue(route);

      const result = await controller.reorder(
        mockRequest(),
        route.id,
        { stopIds: ['stop-2', 'stop-1'] },
      );

      expect(service.reorder).toHaveBeenCalledWith(
        TENANT_ID,
        route.id,
        { stopIds: ['stop-2', 'stop-1'] },
      );
      expect(result).toBeDefined();
    });
  });
});

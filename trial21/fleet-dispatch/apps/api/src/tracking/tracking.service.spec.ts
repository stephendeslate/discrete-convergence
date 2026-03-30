import { TrackingService } from './tracking.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { createTestWorkOrder } from '../../test/helpers/factories';

describe('TrackingService', () => {
  let service: TrackingService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new TrackingService(prisma as never);
  });

  describe('getByToken', () => {
    it('should return tracking info for valid token', async () => {
      const wo = createTestWorkOrder({
        tokenExpiry: new Date(Date.now() + 86400000),
        technician: { firstName: 'John', lastName: 'Tech', latitude: null, longitude: null },
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      const result = await service.getByToken(wo.trackingToken as string);
      expect(result.sequenceNumber).toBe(wo.sequenceNumber);
    });

    it('should throw for unknown token', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.getByToken('bad-token')).rejects.toThrow(
        'Tracking token not found',
      );
    });

    it('should throw for expired token', async () => {
      const wo = createTestWorkOrder({
        tokenExpiry: new Date(Date.now() - 86400000),
      });
      prisma.workOrder.findFirst.mockResolvedValue(wo);

      await expect(
        service.getByToken(wo.trackingToken as string),
      ).rejects.toThrow('Tracking token expired');
    });
  });
});

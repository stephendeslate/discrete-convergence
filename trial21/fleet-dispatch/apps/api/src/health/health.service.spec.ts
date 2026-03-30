import { HealthService } from './health.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new HealthService(prisma as never);
  });

  describe('getHealth', () => {
    it('should return ok status with version', () => {
      const result = service.getHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getReady', () => {
    it('should return connected when DB is available', async () => {
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.getReady();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('should return disconnected when DB fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('DB down'));

      const result = await service.getReady();
      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
    });
  });
});

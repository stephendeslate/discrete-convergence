// TRACED:EM-MON-010 — Health and readiness endpoint tests
import { MonitoringService } from '../src/monitoring/monitoring.service';
import { APP_VERSION } from '@event-management/shared';

describe('MonitoringService', () => {
  let service: MonitoringService;
  const mockPrisma = {
    $queryRawUnsafe: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MonitoringService(mockPrisma as never);
  });

  describe('getHealth', () => {
    it('should return health status with version and uptime', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBe(APP_VERSION);
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('getReadiness', () => {
    it('should return ready when database is available', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReadiness();

      expect(result.status).toBe('ready');
      expect(result.database).toBe('ok');
    });

    it('should return not_ready when database is unavailable', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.database).toBe('unavailable');
    });
  });
});

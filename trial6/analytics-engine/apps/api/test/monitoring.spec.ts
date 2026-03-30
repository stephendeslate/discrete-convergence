// TRACED:AE-MON-006 — Monitoring service tests
import { MonitoringService } from '../src/monitoring/monitoring.service';
import { createMockPrismaService } from './helpers/setup';
import { APP_VERSION } from '@analytics-engine/shared';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new MonitoringService(mockPrisma as never);
  });

  describe('getHealth', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const health = await service.getHealth();

      expect(health.status).toBe('healthy');
      expect(health.database).toBe('connected');
      expect(health.version).toBe(APP_VERSION);
      // Verify timestamp is a valid ISO string
      expect(new Date(health.timestamp).toISOString()).toBe(health.timestamp);
    });

    it('should return degraded status when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const health = await service.getHealth();

      expect(health.status).toBe('degraded');
      expect(health.database).toBe('disconnected');
      // Still returns version even when degraded
      expect(health.version).toBe(APP_VERSION);
    });
  });

  describe('getMetrics', () => {
    it('should return memory metrics with computed values from process', async () => {
      const metrics = await service.getMetrics();

      // Verify memory values are actual numbers from process.memoryUsage()
      expect(metrics.memoryUsage.rss).toBeGreaterThan(0);
      expect(metrics.memoryUsage.heapUsed).toBeGreaterThan(0);
      expect(metrics.memoryUsage.heapTotal).toBeGreaterThanOrEqual(metrics.memoryUsage.heapUsed);
      // Verify uptime is a positive number
      expect(metrics.uptime).toBeGreaterThan(0);
      expect(metrics.version).toBe(APP_VERSION);
    });

    it('should return a valid ISO timestamp', async () => {
      const before = new Date().toISOString();
      const metrics = await service.getMetrics();
      const after = new Date().toISOString();

      // Timestamp should be between before and after
      expect(metrics.timestamp >= before).toBe(true);
      expect(metrics.timestamp <= after).toBe(true);
    });
  });
});

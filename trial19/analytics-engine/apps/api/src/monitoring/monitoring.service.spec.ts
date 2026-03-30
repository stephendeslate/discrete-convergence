import { Test } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MonitoringService],
    }).compile();
    service = module.get(MonitoringService);
  });

  describe('getHealth', () => {
    it('should return health status with ok and version', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMetrics', () => {
    it('should return zero metrics initially', () => {
      const result = service.getMetrics();

      expect(result.requestCount).toBe(0);
      expect(result.errorCount).toBe(0);
      expect(result.averageResponseTime).toBe(0);
    });

    it('should reflect recorded requests', () => {
      service.recordRequest(100, false);
      service.recordRequest(200, false);
      service.recordRequest(50, true);

      const result = service.getMetrics();

      expect(result.requestCount).toBe(3);
      expect(result.errorCount).toBe(1);
      expect(result.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('recordRequest', () => {
    it('should increment request count on each call', () => {
      service.recordRequest(10, false);
      service.recordRequest(20, false);

      const metrics = service.getMetrics();
      expect(metrics.requestCount).toBe(2);
      expect(metrics.errorCount).toBe(0);
    });

    it('should increment error count for error requests', () => {
      service.recordRequest(10, true);

      const metrics = service.getMetrics();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
    });
  });
});

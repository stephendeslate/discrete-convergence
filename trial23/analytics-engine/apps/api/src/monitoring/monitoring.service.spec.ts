import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoringService],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(MonitoringService);
  });

  describe('recordRequest', () => {
    it('should track request count and response time for a tenant', () => {
      service.recordRequest('t1', 50);
      service.recordRequest('t1', 100);

      const metrics = service.getMetrics('t1');

      expect(metrics.requestCount).toBe(2);
      expect(metrics.avgResponseTimeMs).toBe(75);
    });
  });

  describe('recordError', () => {
    it('should track error count for a tenant', () => {
      service.recordError('t1');
      service.recordError('t1');

      const metrics = service.getMetrics('t1');

      expect(metrics.errorCount).toBe(2);
      expect(metrics.requestCount).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should return zero metrics for unknown tenant', () => {
      const metrics = service.getMetrics('unknown');

      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.avgResponseTimeMs).toBe(0);
      expect(metrics.uptimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should isolate metrics between tenants', () => {
      service.recordRequest('t1', 100);
      service.recordError('t2');

      const t1Metrics = service.getMetrics('t1');
      const t2Metrics = service.getMetrics('t2');

      expect(t1Metrics.requestCount).toBe(1);
      expect(t1Metrics.errorCount).toBe(0);
      expect(t2Metrics.requestCount).toBe(0);
      expect(t2Metrics.errorCount).toBe(1);
    });
  });
});

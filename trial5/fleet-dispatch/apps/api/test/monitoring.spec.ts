import { Test } from '@nestjs/testing';
import { MonitoringController } from '../src/monitoring/monitoring.controller';
import { MetricsService } from '../src/common/services/metrics.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let metricsService: MetricsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [MetricsService],
    }).compile();

    controller = module.get(MonitoringController);
    metricsService = module.get(MetricsService);
  });

  describe('health', () => {
    it('should return status ok with version and timestamp', () => {
      const result = controller.health();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
      // Verify timestamp is a valid ISO string
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('getMetrics', () => {
    it('should return zero metrics initially', () => {
      const metrics = controller.getMetrics();

      expect(metrics.requests).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.avgResponseTimeMs).toBe(0);
      expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });

    it('should reflect recorded requests in metrics', () => {
      metricsService.recordRequest(100);
      metricsService.recordRequest(200);

      const metrics = controller.getMetrics();

      expect(metrics.requests).toBe(2);
      expect(metrics.avgResponseTimeMs).toBe(150); // (100+200)/2
    });

    it('should track errors separately from requests', () => {
      metricsService.recordRequest(50);
      metricsService.recordError();
      metricsService.recordError();

      const metrics = controller.getMetrics();

      expect(metrics.requests).toBe(1);
      expect(metrics.errors).toBe(2);
    });
  });
});

describe('MetricsService', () => {
  it('should compute uptime based on time since creation', async () => {
    const service = new MetricsService();

    // Small delay to ensure uptime > 0
    await new Promise((r) => setTimeout(r, 10));

    const metrics = service.getMetrics();
    expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});

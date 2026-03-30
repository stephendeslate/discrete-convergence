// TRACED:FD-TEST-006 — Monitoring and health check tests
import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from '../src/monitoring/monitoring.controller';
import { PrismaService } from '../src/common/services/prisma.service';
import { MetricsService } from '../src/common/services/metrics.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let metricsService: MetricsService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        MetricsService,
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    metricsService = module.get<MetricsService>(MetricsService);
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return status ok with APP_VERSION', async () => {
      const result = await controller.health();

      expect(result.status).toBe('ok');
      expect(result.version).toBe(APP_VERSION);
      expect(result.timestamp).toBeDefined();
    });

    it('should include ISO timestamp', async () => {
      const result = await controller.health();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('GET /health/ready', () => {
    it('should return ok when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.readiness();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.version).toBe(APP_VERSION);
    });

    it('should return error when database is disconnected', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.readiness();

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics from MetricsService', async () => {
      metricsService.recordRequest();
      metricsService.recordRequest();
      metricsService.recordError();
      metricsService.recordResponseTime(50);
      metricsService.recordResponseTime(100);

      const result = await controller.getMetrics();

      expect(result.totalRequests).toBe(2);
      expect(result.totalErrors).toBe(1);
      expect(result.averageResponseTime).toBe(75);
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return zero values when no requests recorded', async () => {
      const freshMetrics = new MetricsService();

      expect(freshMetrics.getMetrics().totalRequests).toBe(0);
      expect(freshMetrics.getMetrics().averageResponseTime).toBe(0);
    });
  });
});

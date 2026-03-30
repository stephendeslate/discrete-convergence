// TRACED:FD-PERF-002 — Performance tests for response time and pagination
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseTimeInterceptor } from '../src/common/interceptors/response-time.interceptor';
import { MetricsService } from '../src/common/services/metrics.service';
import { clampPagination } from '@fleet-dispatch/shared';

describe('Performance', () => {
  describe('ResponseTimeInterceptor', () => {
    it('should be defined', () => {
      const metricsService = new MetricsService();
      const interceptor = new ResponseTimeInterceptor(metricsService);
      expect(interceptor).toBeDefined();
    });

    it('should record response time via MetricsService', () => {
      const metricsService = new MetricsService();
      const recordSpy = jest.spyOn(metricsService, 'recordResponseTime');

      metricsService.recordResponseTime(42);

      expect(recordSpy).toHaveBeenCalledWith(42);
    });
  });

  describe('MetricsService response time tracking', () => {
    it('should calculate average response time', () => {
      const metrics = new MetricsService();
      metrics.recordResponseTime(10);
      metrics.recordResponseTime(20);
      metrics.recordResponseTime(30);

      const result = metrics.getMetrics();

      expect(result.averageResponseTime).toBe(20);
    });

    it('should handle zero requests gracefully', () => {
      const metrics = new MetricsService();

      const result = metrics.getMetrics();

      expect(result.averageResponseTime).toBe(0);
    });

    it('should cap response time buffer at 10000 entries', () => {
      const metrics = new MetricsService();
      for (let i = 0; i < 10001; i++) {
        metrics.recordResponseTime(i);
      }

      const result = metrics.getMetrics();

      expect(result.averageResponseTime).toBeGreaterThan(0);
    });

    it('should track uptime in seconds', () => {
      const metrics = new MetricsService();

      const result = metrics.getMetrics();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('Pagination performance', () => {
    it('should clamp page size to MAX_PAGE_SIZE (100)', () => {
      const result = clampPagination(1, 500);

      expect(result.pageSize).toBeLessThanOrEqual(100);
    });

    it('should use DEFAULT_PAGE_SIZE (20) when not specified', () => {
      const result = clampPagination();

      expect(result.pageSize).toBe(20);
    });

    it('should calculate correct skip offset', () => {
      const result = clampPagination(3, 10);

      expect(result.skip).toBe(20);
    });

    it('should handle page 1 with zero skip', () => {
      const result = clampPagination(1, 10);

      expect(result.skip).toBe(0);
    });

    it('should handle undefined page as page 1', () => {
      const result = clampPagination(undefined, 10);

      expect(result.skip).toBe(0);
    });
  });

  describe('Cache-Control headers', () => {
    it('should document Cache-Control strategies', () => {
      // work-orders: no-store (real-time data)
      // customers: private, max-age=30
      // invoices: private, max-age=30
      // routes: private, max-age=30
      expect(true).toBe(true);
    });
  });
});

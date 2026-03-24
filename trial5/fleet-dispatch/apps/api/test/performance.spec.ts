import { clampPagination } from '@fleet-dispatch/shared';
import { MetricsService } from '../src/common/services/metrics.service';

describe('Pagination (performance)', () => {
  it('should clamp page to minimum 1', () => {
    const result = clampPagination(-5, 20);
    expect(result.page).toBe(1);
  });

  it('should clamp pageSize to minimum 1', () => {
    const result = clampPagination(1, 0);
    expect(result.pageSize).toBe(1);
  });

  it('should clamp pageSize to maximum 100', () => {
    const result = clampPagination(1, 999);
    expect(result.pageSize).toBe(100);
  });

  it('should default page to 1 when undefined', () => {
    const result = clampPagination(undefined, 10);
    expect(result.page).toBe(1);
  });

  it('should default pageSize to 20 when undefined', () => {
    const result = clampPagination(1, undefined);
    expect(result.pageSize).toBe(20);
  });

  it('should floor fractional page numbers', () => {
    const result = clampPagination(2.7, 10);
    expect(result.page).toBe(2);
  });

  it('should floor fractional page sizes', () => {
    const result = clampPagination(1, 15.9);
    expect(result.pageSize).toBe(15);
  });
});

describe('MetricsService (performance tracking)', () => {
  let metrics: MetricsService;

  beforeEach(() => {
    metrics = new MetricsService();
  });

  it('should compute average response time correctly', () => {
    metrics.recordRequest(100);
    metrics.recordRequest(300);
    metrics.recordRequest(200);

    const result = metrics.getMetrics();
    // (100 + 300 + 200) / 3 = 200
    expect(result.avgResponseTimeMs).toBe(200);
  });

  it('should return 0 avg when no requests recorded', () => {
    const result = metrics.getMetrics();
    expect(result.avgResponseTimeMs).toBe(0);
  });

  it('should independently track errors and requests', () => {
    metrics.recordRequest(50);
    metrics.recordRequest(50);
    metrics.recordError();

    const result = metrics.getMetrics();
    expect(result.requests).toBe(2);
    expect(result.errors).toBe(1);
  });

  it('should round average response time to integer', () => {
    metrics.recordRequest(33);
    metrics.recordRequest(33);
    metrics.recordRequest(34);

    const result = metrics.getMetrics();
    // (33+33+34)/3 = 33.33... rounds to 33
    expect(result.avgResponseTimeMs).toBe(33);
    expect(Number.isInteger(result.avgResponseTimeMs)).toBe(true);
  });
});

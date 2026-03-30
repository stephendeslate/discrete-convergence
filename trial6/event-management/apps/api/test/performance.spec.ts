import { clampPagination } from '@event-management/shared';
import { buildPaginatedResult } from '../src/common/pagination.utils';

describe('Performance - Pagination', () => {
  describe('clampPagination', () => {
    it('should use defaults when no params provided', () => {
      const result = clampPagination({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it('should clamp negative page to 1', () => {
      const result = clampPagination({ page: -5 });
      expect(result.page).toBe(1);
    });

    it('should clamp pageSize to max 100', () => {
      const result = clampPagination({ pageSize: 500 });
      expect(result.pageSize).toBe(100);
    });

    it('should clamp pageSize to min 1', () => {
      const result = clampPagination({ pageSize: 0 });
      expect(result.pageSize).toBe(1);
    });

    it('should calculate skip correctly for page 3 with pageSize 10', () => {
      const result = clampPagination({ page: 3, pageSize: 10 });
      expect(result.skip).toBe(20);
      expect(result.take).toBe(10);
    });

    it('should floor fractional page numbers', () => {
      const result = clampPagination({ page: 2.7 });
      expect(result.page).toBe(2);
    });
  });

  describe('buildPaginatedResult', () => {
    it('should compute totalPages correctly', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = buildPaginatedResult(data, 45, { page: 1, pageSize: 20 });
      expect(result.meta.totalPages).toBe(3); // ceil(45/20)
      expect(result.meta.total).toBe(45);
      expect(result.data).toHaveLength(2);
    });

    it('should handle zero total', () => {
      const result = buildPaginatedResult([], 0, { page: 1, pageSize: 20 });
      expect(result.meta.totalPages).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('should handle exact page boundary', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
      const result = buildPaginatedResult(data, 100, { page: 5, pageSize: 10 });
      expect(result.meta.totalPages).toBe(10); // ceil(100/10)
      expect(result.meta.page).toBe(5);
    });
  });
});

describe('Performance - Response Time', () => {
  it('should create response time header value in expected format', () => {
    const start = performance.now();
    // Simulate some work
    const arr = Array.from({ length: 1000 }, (_, i) => i * i);
    const sum = arr.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0); // Assert on computed value
    const duration = (performance.now() - start).toFixed(2);
    const header = `${duration}ms`;
    expect(header).toMatch(/^\d+\.\d{2}ms$/);
  });
});

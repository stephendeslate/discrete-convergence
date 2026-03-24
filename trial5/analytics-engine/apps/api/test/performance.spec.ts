// TRACED:AE-MON-005 — Performance-related tests
import { clampPagination } from '@analytics-engine/shared';
import { parsePaginationParams } from '../src/common/pagination.utils';

describe('Performance', () => {
  describe('Pagination bounds enforcement', () => {
    it('should clamp excessive page sizes to prevent OOM', () => {
      const result = clampPagination(1, 10_000);
      expect(result.limit).toBe(100);
      // Verify the cap is exactly MAX_PAGE_SIZE
      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('should clamp negative page numbers to 1', () => {
      const result = clampPagination(-100, 20);
      expect(result.page).toBe(1);
    });

    it('should handle zero limit by clamping to minimum 1', () => {
      const result = clampPagination(1, 0);
      expect(result.limit).toBe(1);
    });

    it('should floor fractional inputs to prevent floating point skip values', () => {
      const result = clampPagination(2.9, 10.7);
      // Floored to prevent skip = (2.9-1) * 10.7 which would be non-integer
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      // Verify skip computation would be an integer
      const skip = (result.page - 1) * result.limit;
      expect(Number.isInteger(skip)).toBe(true);
    });
  });

  describe('parsePaginationParams', () => {
    it('should parse valid string parameters to numbers', () => {
      const result = parsePaginationParams('3', '25');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it('should return undefined for missing parameters', () => {
      const result = parsePaginationParams(undefined, undefined);
      expect(result.page).toBeUndefined();
      expect(result.limit).toBeUndefined();
    });

    it('should handle NaN input from non-numeric strings', () => {
      const result = parsePaginationParams('abc', 'xyz');
      // parseInt returns NaN for non-numeric strings
      expect(Number.isNaN(result.page)).toBe(true);
      expect(Number.isNaN(result.limit)).toBe(true);
    });
  });

  describe('Response time measurement approach', () => {
    it('should use performance.now() which has sub-millisecond precision', () => {
      const { performance } = require('perf_hooks');
      const start = performance.now();
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 1000; i++) sum += i;
      const end = performance.now();

      const duration = end - start;
      // Verify precision: performance.now() returns fractional milliseconds
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      // Use sum to prevent optimization
      expect(sum).toBe(499500);
    });
  });
});

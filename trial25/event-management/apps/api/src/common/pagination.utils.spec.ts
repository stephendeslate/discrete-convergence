// Unit tests
import { buildPaginatedResult, calculateSkip } from './pagination.utils';

describe('pagination.utils', () => {
  describe('buildPaginatedResult', () => {
    it('should build paginated result with correct meta', () => {
      const result = buildPaginatedResult(['a', 'b'], 10, { page: 1, pageSize: 2 });
      expect(result.data).toEqual(['a', 'b']);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.totalPages).toBe(5);
    });

    it('should use defaults when no params provided', () => {
      const result = buildPaginatedResult([], 0, {});
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(20);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('calculateSkip', () => {
    it('should calculate correct skip and take values', () => {
      const result = calculateSkip({ page: 3, pageSize: 10 });
      expect(result.skip).toBe(20);
      expect(result.take).toBe(10);
    });

    it('should default to page 1 with default page size', () => {
      const result = calculateSkip({});
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });
  });
});

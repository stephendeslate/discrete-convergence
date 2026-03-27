// TRACED: FD-API-001 — Pagination utilities unit tests
import { paginate, buildPaginatedResult } from './pagination.utils';

describe('pagination.utils', () => {
  describe('paginate', () => {
    it('should return default values when no args provided', () => {
      const result = paginate();

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(10);
    });

    it('should calculate correct skip for page 2', () => {
      const result = paginate(2, 10);

      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
    });

    it('should handle boundary page value of 0 by clamping to 1', () => {
      const result = paginate(0, 10);

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should handle null page and pageSize values', () => {
      const result = paginate(undefined, undefined);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should clamp pageSize to max boundary', () => {
      const result = paginate(1, 999);

      expect(result.pageSize).toBe(100);
    });

    it('should handle negative page boundary by clamping to 1', () => {
      const result = paginate(-5, 10);

      expect(result.page).toBe(1);
    });
  });

  describe('buildPaginatedResult', () => {
    it('should build correct paginated result', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = buildPaginatedResult(data, 20, 1, 10);

      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(20);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(10);
    });

    it('should calculate totalPages correctly with empty data', () => {
      const result = buildPaginatedResult([], 0, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should round up totalPages for partial pages', () => {
      const result = buildPaginatedResult([{ id: '1' }], 11, 1, 10);

      expect(result.meta.totalPages).toBe(2);
    });
  });
});

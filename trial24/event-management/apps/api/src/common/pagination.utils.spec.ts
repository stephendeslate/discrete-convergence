// TRACED:PAGINATION-UTILS-SPEC
import { buildPaginatedResponse, getPrismaSkipTake } from './pagination.utils';

describe('pagination.utils', () => {
  describe('buildPaginatedResponse', () => {
    it('should build response with correct meta', () => {
      const result = buildPaginatedResponse(['a', 'b'], 10, 1, 20);
      expect(result.data).toEqual(['a', 'b']);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 10 });
    });

    it('should use defaults when page and pageSize are undefined', () => {
      const result = buildPaginatedResponse([], 0);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(20);
    });

    it('should clamp pageSize to max 100', () => {
      const result = buildPaginatedResponse([], 0, 1, 500);
      expect(result.meta.pageSize).toBe(100);
    });
  });

  describe('getPrismaSkipTake', () => {
    it('should calculate skip and take for page 1', () => {
      const result = getPrismaSkipTake(1, 20);
      expect(result).toEqual({ skip: 0, take: 20 });
    });

    it('should calculate skip for page 3', () => {
      const result = getPrismaSkipTake(3, 10);
      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('should use defaults for undefined', () => {
      const result = getPrismaSkipTake();
      expect(result).toEqual({ skip: 0, take: 20 });
    });

    it('should handle negative page', () => {
      const result = getPrismaSkipTake(-1, 10);
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should clamp large pageSize', () => {
      const result = getPrismaSkipTake(1, 999);
      expect(result).toEqual({ skip: 0, take: 100 });
    });
  });
});

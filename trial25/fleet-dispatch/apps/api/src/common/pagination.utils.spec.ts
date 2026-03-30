// TRACED:TEST-PAGINATION-UTILS — Pagination utility unit tests
// VERIFY:FD-PAGE-001 — buildSkipTake computes correct offset for page 1
// VERIFY:FD-PAGE-002 — buildSkipTake computes correct offset for later pages
import { buildSkipTake } from './pagination.utils';

describe('Pagination Utils', () => {
  describe('buildSkipTake', () => {
    it('should compute skip=0 for page 1', () => {
      const result = buildSkipTake({ page: 1, pageSize: 20 });
      expect(result).toEqual({ skip: 0, take: 20 });
    });

    it('should compute correct skip for page 3', () => {
      const result = buildSkipTake({ page: 3, pageSize: 10 });
      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('should handle page 2 with pageSize 5', () => {
      const result = buildSkipTake({ page: 2, pageSize: 5 });
      expect(result).toEqual({ skip: 5, take: 5 });
    });
  });
});

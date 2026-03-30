import { getPaginationParams, createPaginatedResult } from './pagination.utils';

describe('PaginationUtils', () => {
  describe('getPaginationParams', () => {
    it('should return defaults when no params provided', () => {
      const result = getPaginationParams();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should clamp limit to MAX_PAGE_SIZE', () => {
      const result = getPaginationParams(1, 200);

      expect(result.limit).toBe(100);
      expect(result.page).toBe(1);
    });

    it('should clamp page to minimum 1', () => {
      const result = getPaginationParams(0, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('createPaginatedResult', () => {
    it('should build correct paginated result', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = createPaginatedResult(data, 50, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
      expect(result.page).toBe(1);
    });
  });
});

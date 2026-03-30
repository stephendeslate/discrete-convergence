import { getPaginationParams, createPaginatedResult } from './pagination.utils';

describe('getPaginationParams', () => {
  it('should return default values when no params provided', () => {
    const result = getPaginationParams();
    expect(result).toEqual({ skip: 0, take: 20 });
  });

  it('should compute skip based on page', () => {
    const result = getPaginationParams(3, 10);
    expect(result).toEqual({ skip: 20, take: 10 });
  });

  it('should clamp limit to MAX_PAGE_SIZE', () => {
    const result = getPaginationParams(1, 500);
    expect(result.take).toBe(100);
  });

  it('should handle page less than 1', () => {
    const result = getPaginationParams(0, 10);
    expect(result.skip).toBe(0);
  });

  it('should handle negative limit', () => {
    const result = getPaginationParams(1, -5);
    expect(result.take).toBe(1);
  });
});

describe('createPaginatedResult', () => {
  it('should create paginated result with correct totalPages', () => {
    const result = createPaginatedResult(['a', 'b'], 10, 1, 5);
    expect(result).toEqual({
      data: ['a', 'b'],
      total: 10,
      page: 1,
      limit: 5,
      totalPages: 2,
    });
  });

  it('should handle empty data', () => {
    const result = createPaginatedResult([], 0, 1, 20);
    expect(result.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });
});

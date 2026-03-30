import { buildPaginatedResult } from './pagination.utils';

describe('buildPaginatedResult', () => {
  it('should calculate total pages correctly', () => {
    const result = buildPaginatedResult(['a', 'b', 'c'], 25, 1, 10);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
    expect(result.data).toHaveLength(3);
  });

  it('should handle empty results', () => {
    const result = buildPaginatedResult([], 0, 1, 10);
    expect(result.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('should handle single page', () => {
    const result = buildPaginatedResult(['a'], 1, 1, 10);
    expect(result.totalPages).toBe(1);
  });

  it('should use default page size for zero limit', () => {
    const result = buildPaginatedResult([], 100, 1, 0);
    expect(result.limit).toBe(20);
  });
});

// TRACED:TEST-PAGINATION — Unit tests for pagination utilities
import { buildPaginatedResult } from './pagination.utils';

describe('buildPaginatedResult', () => {
  it('should build a correct paginated result', () => {
    const result = buildPaginatedResult(['a', 'b'], 10, 1, 5);
    expect(result.data).toEqual(['a', 'b']);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.total).toBe(10);
    expect(result.meta.totalPages).toBe(2);
  });

  it('should use default pagination when params are undefined', () => {
    const result = buildPaginatedResult([], 0);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(20);
    expect(result.meta.totalPages).toBe(0);
  });

  it('should handle single page of results', () => {
    const result = buildPaginatedResult(['x'], 1, 1, 10);
    expect(result.meta.totalPages).toBe(1);
  });

  it('should clamp limit to MAX_PAGE_SIZE', () => {
    const result = buildPaginatedResult([], 0, 1, 999);
    expect(result.meta.limit).toBe(100);
  });
});

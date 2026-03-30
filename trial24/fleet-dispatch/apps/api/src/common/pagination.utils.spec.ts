// TRACED:API-PAGINATION-UTILS-SPEC
import { buildPaginatedResponse, buildSkipTake } from './pagination.utils';

describe('buildPaginatedResponse', () => {
  it('builds correct pagination meta', () => {
    const result = buildPaginatedResponse(['a', 'b'], 50, 1, 20);
    expect(result.data).toEqual(['a', 'b']);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(20);
    expect(result.meta.total).toBe(50);
    expect(result.meta.totalPages).toBe(3);
  });

  it('calculates totalPages correctly', () => {
    const result = buildPaginatedResponse([], 0, 1, 20);
    expect(result.meta.totalPages).toBe(0);
  });

  it('uses defaults when no page/limit provided', () => {
    const result = buildPaginatedResponse([], 10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(20);
  });
});

describe('buildSkipTake', () => {
  it('calculates skip for page 1', () => {
    const result = buildSkipTake(1, 20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('calculates skip for page 3', () => {
    const result = buildSkipTake(3, 10);
    expect(result.skip).toBe(20);
    expect(result.take).toBe(10);
  });

  it('clamps limit to MAX_PAGE_SIZE', () => {
    const result = buildSkipTake(1, 500);
    expect(result.take).toBe(100);
  });

  it('clamps page to minimum 1', () => {
    const result = buildSkipTake(-1, 20);
    expect(result.skip).toBe(0);
  });
});

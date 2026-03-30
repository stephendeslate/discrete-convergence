// TRACED:PAG-UTILS-TEST — Pagination utils tests
import { getPrismaSkipTake, paginateResponse } from './pagination.utils';

describe('pagination.utils', () => {
  it('should calculate skip and take', () => {
    expect(getPrismaSkipTake(1, 10)).toEqual({ skip: 0, take: 10 });
    expect(getPrismaSkipTake(2, 10)).toEqual({ skip: 10, take: 10 });
  });

  it('should clamp take to max 100', () => {
    expect(getPrismaSkipTake(1, 200)).toEqual({ skip: 0, take: 100 });
  });

  it('should create paginated response', () => {
    const result = paginateResponse([1, 2, 3], 10, 1, 3);
    expect(result.data).toEqual([1, 2, 3]);
    expect(result.meta.total).toBe(10);
    expect(result.meta.totalPages).toBe(4);
  });
});

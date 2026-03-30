import { clampPagination, paginationToSkipTake } from '../src/pagination';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../src/constants';

describe('clampPagination', () => {
  it('should return defaults when no params provided', () => {
    const result = clampPagination();
    expect(result).toEqual({ page: 1, limit: DEFAULT_PAGE_SIZE });
  });

  it('should clamp limit to MAX_PAGE_SIZE', () => {
    const result = clampPagination(1, 500);
    expect(result.limit).toBe(MAX_PAGE_SIZE);
  });

  it('should clamp page to minimum 1', () => {
    const result = clampPagination(-5, 10);
    expect(result.page).toBe(1);
  });

  it('should clamp limit to minimum 1', () => {
    const result = clampPagination(1, 0);
    expect(result.limit).toBe(1);
  });

  it('should pass through valid values', () => {
    const result = clampPagination(3, 50);
    expect(result).toEqual({ page: 3, limit: 50 });
  });
});

describe('paginationToSkipTake', () => {
  it('should calculate skip and take for page 1', () => {
    const result = paginationToSkipTake({ page: 1, limit: 20 });
    expect(result).toEqual({ skip: 0, take: 20 });
  });

  it('should calculate skip and take for page 3', () => {
    const result = paginationToSkipTake({ page: 3, limit: 10 });
    expect(result).toEqual({ skip: 20, take: 10 });
  });
});

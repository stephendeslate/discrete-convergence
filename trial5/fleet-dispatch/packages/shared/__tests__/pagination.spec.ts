import { clampPagination } from '../src/pagination';

describe('clampPagination', () => {
  it('should use defaults when no args provided', () => {
    const result = clampPagination();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('should clamp page size to MAX_PAGE_SIZE', () => {
    const result = clampPagination(1, 500);
    expect(result.pageSize).toBe(100);
  });

  it('should clamp negative page to 1', () => {
    const result = clampPagination(-5, 10);
    expect(result.page).toBe(1);
  });

  it('should clamp zero page size to 1', () => {
    const result = clampPagination(1, 0);
    expect(result.pageSize).toBe(1);
  });

  it('should floor fractional values', () => {
    const result = clampPagination(2.7, 15.3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(15);
  });
});

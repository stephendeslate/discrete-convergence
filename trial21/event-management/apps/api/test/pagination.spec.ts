import { buildPagination } from '../src/common/pagination.utils';

describe('Pagination Utils', () => {
  it('should compute correct skip/take for page 1', () => {
    const result = buildPagination(1, 20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('should compute correct skip/take for page 3', () => {
    const result = buildPagination(3, 10);
    expect(result.skip).toBe(20);
    expect(result.take).toBe(10);
  });

  it('should handle page 1 with limit 100', () => {
    const result = buildPagination(1, 100);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(100);
  });
});

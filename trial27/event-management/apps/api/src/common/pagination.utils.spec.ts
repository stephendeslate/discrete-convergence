import { getPaginationParams, paginate } from './pagination.utils';

describe('getPaginationParams', () => {
  it('should return defaults when no params provided', () => {
    const result = getPaginationParams();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
  });

  it('should calculate skip correctly for page 2', () => {
    const result = getPaginationParams('2', '10');
    expect(result.skip).toBe(10);
    expect(result.take).toBe(10);
  });

  it('should handle invalid page string as boundary value', () => {
    const result = getPaginationParams('0', '10');
    expect(result.page).toBeGreaterThanOrEqual(1);
  });

  it('should clamp overflow pageSize to maximum', () => {
    const result = getPaginationParams('1', '10000');
    expect(result.pageSize).toBeLessThanOrEqual(100);
  });
});

describe('paginate', () => {
  it('should return correct paginated structure', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = paginate(data, 25, 1, 10);

    expect(result.data).toEqual(data);
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
  });

  it('should return empty data array when no results', () => {
    const result = paginate([], 0, 1, 10);
    expect(result.data).toHaveLength(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('should handle boundary case with exact page division', () => {
    const result = paginate([], 20, 2, 10);
    expect(result.meta.totalPages).toBe(2);
  });
});

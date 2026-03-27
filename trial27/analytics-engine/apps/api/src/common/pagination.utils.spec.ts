import { parsePagination, paginatedResponse } from './pagination.utils';

describe('parsePagination', () => {
  it('should return defaults when no params provided', () => {
    const result = parsePagination();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('should calculate skip correctly for page 2', () => {
    const result = parsePagination(2, 10);
    expect(result.skip).toBe(10);
    expect(result.take).toBe(10);
  });

  it('should calculate skip correctly for page 3', () => {
    const result = parsePagination(3, 25);
    expect(result.skip).toBe(50);
  });

  it('should clamp page to minimum of 1', () => {
    const result = parsePagination(0, 20);
    expect(result.page).toBeGreaterThanOrEqual(1);
  });

  it('should clamp pageSize to maximum', () => {
    const result = parsePagination(1, 10000);
    expect(result.pageSize).toBeLessThanOrEqual(100);
  });
});

describe('paginatedResponse', () => {
  it('should return correct structure', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const pagination = { page: 1, pageSize: 10, skip: 0, take: 10 };

    const result = paginatedResponse(data, 25, pagination);

    expect(result.data).toEqual(data);
    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(10);
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
  });

  it('should calculate totalPages correctly with exact division', () => {
    const pagination = { page: 1, pageSize: 10, skip: 0, take: 10 };
    const result = paginatedResponse([], 20, pagination);
    expect(result.meta.totalPages).toBe(2);
  });

  it('should return empty data array', () => {
    const pagination = { page: 1, pageSize: 10, skip: 0, take: 10 };
    const result = paginatedResponse([], 0, pagination);
    expect(result.data).toHaveLength(0);
    expect(result.meta.totalPages).toBe(0);
  });
});

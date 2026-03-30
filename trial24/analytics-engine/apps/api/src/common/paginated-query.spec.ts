// TRACED:PAGINATED-QUERY-SPEC
import 'reflect-metadata';
import { PaginatedQuery } from './paginated-query';

describe('PaginatedQuery', () => {
  it('should be instantiable', () => {
    const query = new PaginatedQuery();
    expect(query).toBeDefined();
  });

  it('should accept page and limit', () => {
    const query = new PaginatedQuery();
    query.page = 2;
    query.limit = 50;
    expect(query.page).toBe(2);
    expect(query.limit).toBe(50);
  });

  it('should allow optional fields to be undefined', () => {
    const query = new PaginatedQuery();
    expect(query.page).toBeUndefined();
    expect(query.limit).toBeUndefined();
  });
});

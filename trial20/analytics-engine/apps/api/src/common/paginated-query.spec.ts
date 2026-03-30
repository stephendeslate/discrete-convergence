import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginatedQueryDto } from './paginated-query';

describe('PaginatedQueryDto', () => {
  it('should accept valid page and limit', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { page: 2, limit: 50 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept empty query (all optional)', async () => {
    const dto = plainToInstance(PaginatedQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject negative page values', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { page: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should reject limit exceeding MAX_PAGE_SIZE', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { limit: 200 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });
});

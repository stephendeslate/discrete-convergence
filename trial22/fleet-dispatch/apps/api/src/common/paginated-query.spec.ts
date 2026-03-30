import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginatedQueryDto } from './paginated-query';

describe('PaginatedQueryDto', () => {
  it('should be defined', () => {
    const dto = new PaginatedQueryDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(PaginatedQueryDto);
  });

  it('should accept valid page and limit', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { page: 1, limit: 10 });
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
  });

  it('should accept empty query (both optional)', async () => {
    const dto = plainToInstance(PaginatedQueryDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.page).toBeUndefined();
  });

  it('should reject page less than 1', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { page: 0 });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should reject non-integer limit', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { limit: 1.5 });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });
});

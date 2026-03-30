import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

/**
 * Base DTO for paginated queries.
 * VERIFY: AE-DATA-002 — pagination DTO enforces max page size
 */
export class PaginatedQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE) // TRACED: AE-DATA-002
  @Type(() => Number)
  limit?: number = DEFAULT_PAGE_SIZE;
}

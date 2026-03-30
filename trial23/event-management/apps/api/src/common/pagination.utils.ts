// TRACED: EM-API-004 — Pagination via clampPagination (MAX_PAGE_SIZE=100)
// TRACED: EM-EDGE-005 — Null pagination → DEFAULT_PAGE_SIZE boundary
// TRACED: EM-EDGE-006 — Overflow page size → MAX_PAGE_SIZE boundary
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_PAGE_SIZE } from '@repo/shared';

export class PaginatedQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

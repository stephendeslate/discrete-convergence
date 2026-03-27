// TRACED: EM-EDGE-010 — Paginated query DTO with validation
import { IsOptional, IsNumberString } from 'class-validator';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@event-management/shared';

/** Maximum allowed page size: {@link MAX_PAGE_SIZE} = ${MAX_PAGE_SIZE} */
/** Default page size when not specified: {@link DEFAULT_PAGE_SIZE} = ${DEFAULT_PAGE_SIZE} */

export class PaginatedQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;
}

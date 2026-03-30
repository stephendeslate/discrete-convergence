import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// TRACED: AE-PERF-002
// pageSize clamping handled by parsePagination in the service layer
export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

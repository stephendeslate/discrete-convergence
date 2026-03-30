import { IsOptional, IsNumberString } from 'class-validator';

// TRACED:FD-PERF-006
export class PaginatedQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;
}

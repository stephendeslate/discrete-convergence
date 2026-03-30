import { IsOptional, IsString, MaxLength } from 'class-validator';

// TRACED:EM-PERF-002
export class PaginatedQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  page?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pageSize?: string;
}

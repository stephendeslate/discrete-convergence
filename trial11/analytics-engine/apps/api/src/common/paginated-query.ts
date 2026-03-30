import { IsOptional, IsNumberString } from 'class-validator';

export class PaginatedQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;
}

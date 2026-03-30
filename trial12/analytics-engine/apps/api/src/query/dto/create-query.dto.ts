import { IsString, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

// TRACED: AE-QUERY-001
export class CreateQueryDto {
  @IsString()
  @MaxLength(5000)
  query!: string;

  @IsString()
  @MaxLength(36)
  dataSourceId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  executionTime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rowCount?: number;
}

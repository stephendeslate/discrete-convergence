import { IsString, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

// TRACED: AE-DS-001
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsString()
  @MaxLength(5000)
  config!: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(86400)
  refreshRate?: number;
}

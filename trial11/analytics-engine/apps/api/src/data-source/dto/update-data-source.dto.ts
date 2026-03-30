import { IsString, MaxLength, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'ERROR'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(86400)
  refreshRate?: number;
}

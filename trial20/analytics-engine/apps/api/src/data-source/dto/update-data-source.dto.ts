import { IsString, MaxLength, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  connectionString?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

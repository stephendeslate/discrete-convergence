import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['POSTGRES', 'MYSQL', 'REST_API', 'CSV'])
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

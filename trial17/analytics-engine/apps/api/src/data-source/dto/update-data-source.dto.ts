import { IsString, IsOptional, MaxLength, IsIn, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  type?: string;

  @IsOptional()
  @IsObject()
  connectionInfo?: Record<string, unknown>;
}

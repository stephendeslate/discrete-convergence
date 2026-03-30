import { IsString, IsOptional, MaxLength, IsIn, IsObject } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  type!: string;

  @IsOptional()
  @IsObject()
  connectionInfo?: Record<string, unknown>;
}

// TRACED:AE-API-004 — DTO validation with class-validator decorators
import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(['POSTGRES', 'MYSQL', 'REST_API', 'CSV'])
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

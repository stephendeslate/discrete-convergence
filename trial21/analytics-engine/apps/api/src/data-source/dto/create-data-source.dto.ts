import { IsString, MaxLength, IsEnum, IsOptional, IsObject } from 'class-validator';
import { DataSourceType } from '@prisma/client';

/**
 * VERIFY: AE-DS-001 — data source DTO with type and config validation
 */
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(DataSourceType)
  @IsString()
  @MaxLength(36)
  type!: DataSourceType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

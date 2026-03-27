import { IsString, IsEnum, IsOptional, IsObject, MaxLength } from 'class-validator';
import { DataSourceType } from '@analytics-engine/shared';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(DataSourceType)
  type!: DataSourceType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

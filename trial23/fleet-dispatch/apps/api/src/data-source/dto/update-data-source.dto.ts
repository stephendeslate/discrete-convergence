import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DataSourceType } from './create-data-source.dto';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @IsOptional()
  @IsString()
  connectionString?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

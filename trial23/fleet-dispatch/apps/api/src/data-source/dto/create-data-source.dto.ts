import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum DataSourceType {
  POSTGRES = 'POSTGRES',
  MYSQL = 'MYSQL',
  REST_API = 'REST_API',
  CSV = 'CSV',
}

export class CreateDataSourceDto {
  @IsString()
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;

  @IsString()
  connectionString: string;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

enum DataSourceType {
  REST_API = 'REST_API',
  POSTGRESQL = 'POSTGRESQL',
  CSV = 'CSV',
  WEBHOOK = 'WEBHOOK',
}

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(DataSourceType)
  type!: DataSourceType;

  @IsString()
  @MaxLength(4096)
  connectionConfig!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  syncSchedule?: string;
}

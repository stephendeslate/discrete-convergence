import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(['REST_API', 'POSTGRESQL', 'CSV', 'WEBHOOK'])
  connectorType!: string;

  @IsString()
  @MaxLength(5000)
  configEncrypted!: string;

  @IsOptional()
  @IsIn(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY'])
  syncSchedule?: string;
}

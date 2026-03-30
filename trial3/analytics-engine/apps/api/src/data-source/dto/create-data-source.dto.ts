import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

const DATA_SOURCE_TYPES = ['REST_API', 'POSTGRESQL', 'CSV', 'WEBHOOK'] as const;
const SYNC_SCHEDULES = ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'REALTIME'] as const;

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(DATA_SOURCE_TYPES)
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsString()
  @MaxLength(5000)
  configEncrypted!: string;

  @IsOptional()
  @IsIn(SYNC_SCHEDULES)
  @IsString()
  @MaxLength(20)
  schedule?: string;
}

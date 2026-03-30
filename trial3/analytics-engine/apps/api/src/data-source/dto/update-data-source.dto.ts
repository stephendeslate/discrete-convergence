import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

const SYNC_SCHEDULES = ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'REALTIME'] as const;

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(SYNC_SCHEDULES)
  @IsString()
  @MaxLength(20)
  schedule?: string;
}

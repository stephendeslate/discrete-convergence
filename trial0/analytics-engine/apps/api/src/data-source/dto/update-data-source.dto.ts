import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY'])
  syncSchedule?: string;
}

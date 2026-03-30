import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  connectionConfig?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  syncSchedule?: string;
}

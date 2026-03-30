import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

// TRACED: EM-SCHED-002
export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  speaker?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  room?: string;
}

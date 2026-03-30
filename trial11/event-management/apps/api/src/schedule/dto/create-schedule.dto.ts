import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

// TRACED: EM-SCHED-001
export class CreateScheduleDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}

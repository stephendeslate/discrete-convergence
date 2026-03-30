import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

// TRACED: EM-SCHED-001
export class CreateScheduleDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

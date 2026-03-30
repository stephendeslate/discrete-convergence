import { IsString, MaxLength, IsDateString } from 'class-validator';

// TRACED: EM-SCHED-001
export class CreateScheduleDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(255)
  speaker!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsString()
  @MaxLength(100)
  room!: string;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}

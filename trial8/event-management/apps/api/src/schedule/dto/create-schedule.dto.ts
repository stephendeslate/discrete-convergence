import { IsString, IsUUID, IsOptional, IsDateString, MaxLength } from 'class-validator';

// TRACED: EM-DATA-008 — Schedule creation DTO
export class CreateScheduleDto {
  @IsUUID()
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  startTime!: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  room?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  speaker?: string;
}

import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  speakerId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: string;
}

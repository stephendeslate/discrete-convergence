// TRACED:EM-SES-001 TRACED:EM-SES-005
import { IsString, IsOptional, IsDateString, IsUUID, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @MaxLength(50)
  startTime!: string;

  @IsDateString()
  @MaxLength(50)
  endTime!: string;

  @IsUUID()
  @MaxLength(36)
  eventId!: string;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  speakerId?: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  startTime?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  endTime?: string;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  speakerId?: string;
}

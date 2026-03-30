// TRACED:EM-SEC-004 — DTO validation: @IsString + @MaxLength on all strings, @MaxLength(36) on UUIDs
import { IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(255)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsDateString()
  @MaxLength(30)
  startDate!: string;

  @IsDateString()
  @MaxLength(30)
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}

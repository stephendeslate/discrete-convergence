// TRACED: EM-SEC-002 — Create event DTO with validation
// TRACED: EM-EDGE-001 — Malformed input validation
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

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

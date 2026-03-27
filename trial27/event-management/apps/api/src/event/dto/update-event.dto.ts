// TRACED: EM-SEC-002 — Update event DTO with validation
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}

// TRACED: FD-API-004 — Update dispatch job DTO with validation
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UpdateDispatchJobDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  scheduledAt?: string;
}

// TRACED:FD-TRP-001 — Create trip DTO
import { IsString, IsDateString, MaxLength } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MaxLength(36)
  dispatchId!: string;

  @IsString()
  @MaxLength(255)
  startLocation!: string;

  @IsString()
  @MaxLength(255)
  endLocation!: string;

  @IsDateString()
  startTime!: string;
}

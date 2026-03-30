// TRACED:FD-TRP-006 — Update trip DTO
import { IsString, IsOptional, IsNumber, MaxLength, IsDateString, Min } from 'class-validator';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  startLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endLocation?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;
}

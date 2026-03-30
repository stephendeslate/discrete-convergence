import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

// TRACED: EM-DATA-009 — Venue update DTO
export class UpdateVenueDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}

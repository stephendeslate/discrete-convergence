import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

/** TRACED:EM-VEN-001 — Venue DTO with capacity validation */
export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}

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
  @IsInt()
  @Min(1)
  capacity?: number;
}

// TRACED: EM-SEC-002 — Update venue DTO with validation
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

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

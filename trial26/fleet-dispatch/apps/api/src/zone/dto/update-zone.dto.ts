// TRACED:FD-ZNE-002 — Update zone DTO
import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsObject()
  boundaries?: Record<string, unknown>;
}

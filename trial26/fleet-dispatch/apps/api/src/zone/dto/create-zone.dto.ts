// TRACED:FD-ZNE-001 — Create zone DTO
import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsObject()
  boundaries!: Record<string, unknown>;
}

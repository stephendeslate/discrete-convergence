// TRACED:API-ZONE-DTO
import { IsString, IsOptional, IsObject, MinLength } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  polygon!: Record<string, unknown>;
}

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  polygon?: Record<string, unknown>;
}

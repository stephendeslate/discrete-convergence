// TRACED:DASH-DTO-CREATE — Create dashboard DTO
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * TRACED:AE-DASH-DTO-001 — Create dashboard DTO
 */
export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// TRACED:DASH-DTO-UPDATE — Update dashboard DTO
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * TRACED:AE-DASH-DTO-002 — Update dashboard DTO
 */
export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// TRACED:WIDGET-DTO-UPDATE — Update widget DTO
import { IsString, IsOptional, IsInt, IsObject, MaxLength, Min } from 'class-validator';

/**
 * TRACED:AE-WID-DTO-002 — Update widget DTO
 */
export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

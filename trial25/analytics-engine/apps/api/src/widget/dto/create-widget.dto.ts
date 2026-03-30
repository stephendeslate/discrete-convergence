// TRACED:WIDGET-DTO-CREATE — Create widget DTO
import { IsString, IsOptional, IsInt, IsObject, MaxLength, Min } from 'class-validator';

/**
 * TRACED:AE-WID-DTO-001 — Create widget DTO
 */
export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;
}

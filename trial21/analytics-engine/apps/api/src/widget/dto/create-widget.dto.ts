import { IsString, MaxLength, IsEnum, IsOptional, IsInt, Min, Max, IsObject, IsUUID } from 'class-validator';
import { WidgetType } from '@prisma/client';

/**
 * VERIFY: AE-WIDGET-001 — widget creation DTO with type validation
 */
export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsEnum(WidgetType)
  @IsString()
  @MaxLength(36)
  type!: WidgetType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  positionY?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  height?: number;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  dataSourceId?: string;
}

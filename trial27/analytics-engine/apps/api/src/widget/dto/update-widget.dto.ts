import { IsString, IsEnum, IsOptional, IsObject, IsInt, Min, Max, MaxLength } from 'class-validator';
import { WidgetType } from '@analytics-engine/shared';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(WidgetType)
  type?: WidgetType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
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
}

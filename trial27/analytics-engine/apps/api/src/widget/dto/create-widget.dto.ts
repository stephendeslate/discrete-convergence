import { IsString, IsEnum, IsOptional, IsObject, MaxLength } from 'class-validator';
import { WidgetType } from '@analytics-engine/shared';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}

// TRACED:WIDGET-DTO — Validation DTOs for widget CRUD
import { IsString, IsOptional, IsInt, IsObject, MaxLength, IsUUID, Min } from 'class-validator';

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

  @IsUUID()
  dashboardId!: string;
}

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

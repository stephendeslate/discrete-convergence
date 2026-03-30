import { IsString, MaxLength, IsOptional, IsIn, IsNumber, IsObject, Min, Max } from 'class-validator';

// TRACED:AE-WIDG-001
export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  @MaxLength(20)
  type!: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  positionX?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  positionY?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(24)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(24)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(5)
  refreshRate?: number;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  dataSourceId?: string;
}

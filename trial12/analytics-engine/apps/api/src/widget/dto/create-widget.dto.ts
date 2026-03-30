import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

// TRACED: AE-WIDGET-001
export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI', 'SCATTER_PLOT'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
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

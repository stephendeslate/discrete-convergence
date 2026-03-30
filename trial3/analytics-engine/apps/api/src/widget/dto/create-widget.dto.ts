import { IsString, MaxLength, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

const WIDGET_TYPES = [
  'LINE_CHART', 'BAR_CHART', 'PIE_CHART', 'AREA_CHART',
  'KPI_CARD', 'TABLE', 'FUNNEL',
] as const;

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsIn(WIDGET_TYPES)
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridColumn?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  gridRow?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridWidth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridHeight?: number;
}

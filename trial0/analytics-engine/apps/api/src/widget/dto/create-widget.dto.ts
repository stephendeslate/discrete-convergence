import { IsString, MaxLength, IsIn, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsIn(['LINE', 'BAR', 'PIE', 'DONUT', 'AREA', 'KPI', 'TABLE', 'FUNNEL'])
  chartType!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsInt()
  gridColumn!: number;

  @IsInt()
  gridRow!: number;

  @IsInt()
  gridWidth!: number;

  @IsInt()
  gridHeight!: number;

  @IsString()
  @MaxLength(36)
  dataSourceId!: string;
}
